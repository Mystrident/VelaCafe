const crypto = require("crypto");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Item = require("../models/Item");
const User = require("../models/User");
const Counter = require("../models/Counter");
const PendingPayment = require("../models/PendingPayment");

// Helper to get local date string safely
const getLocalDate = () => {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).split('/').reverse().join('-'); // Formats to YYYY-MM-DD
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { pickupTime, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }
    if (items.length > 30) {
      return res.status(400).json({ message: "Too many items" });
    }
    
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const cartItem of items) {
      if (!mongoose.isValidObjectId(cartItem.itemId)) {
        return res.status(400).json({ message: "Invalid item" });
      }
      const item = await Item.findById(cartItem.itemId);
      if (!item || !item.available) {
        return res.status(404).json({ message: "Item not found" });
      }
      const quantity = Number(cartItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      if (item.stock < quantity) {
        return res.status(400).json({
          message: `Oops! Only ${item.stock} ${item.name} left. Someone just bought the rest.`,
        });
      }
      totalAmount += item.price * quantity;
      validatedItems.push({
        itemId: item._id,
        name: item.name,
        quantity,
        price: item.price,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await PendingPayment.create({
      razorpayOrderId: razorpayOrder.id,
      userId: req.user.id,
      pickupTime,
      items: validatedItems,
      totalAmount,
    });

    res.json({ razorpayOrder, pickupTime, validatedItems, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(generatedSignature, "utf8");
    const received = Buffer.from(razorpay_signature, "utf8");

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const pending = await PendingPayment.findOneAndDelete(
      { razorpayOrderId: razorpay_order_id, userId: req.user.id },
      { session }
    );

    if (!pending) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "No matching payment found or it was already processed",
      });
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const io = req.app.get("io");
    let outOfStockDuringPayment = false;
    let failedItems = [];
    const successfulUpdates = [];

    for (const purchasedItem of pending.items) {
      const updatedItem = await Item.findOneAndUpdate(
        {
          _id: purchasedItem.itemId,
          stock: { $gte: purchasedItem.quantity },
        },
        { $inc: { stock: -purchasedItem.quantity } },
        { new: true, session }
      );

      if (!updatedItem) {
        outOfStockDuringPayment = true;
        failedItems.push(purchasedItem.name);
      } else {
        successfulUpdates.push(updatedItem);
      }
    }

    // Generate Order Number safely
    const today = getLocalDate();
    const counter = await Counter.findOneAndUpdate(
      { date: today },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session }
    );

    // If any item failed, we abort the transaction to restore stock, but we still need to record the refund requirement outside the transaction.
    if (outOfStockDuringPayment) {
      await session.abortTransaction();
      session.endSession();

      // Create a refund record outside the aborted transaction
      const failedOrder = new Order({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        orderDate: today,
        pickupTime: pending.pickupTime,
        items: pending.items,
        totalAmount: pending.totalAmount,
        orderNumber: counter.sequence,
        paymentStatus: "REFUND_REQUIRED",
        status: "Pending",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
      await failedOrder.save();

      return res.status(201).json({
        message: `Payment successful, but ${failedItems.join(", ")} sold out while you were paying. Please see the cafe admin for a refund.`,
        order: failedOrder,
        warning: true,
      });
    }

    // If everything succeeded, commit the transaction
    const order = new Order({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      orderDate: today,
      pickupTime: pending.pickupTime,
      items: pending.items,
      totalAmount: pending.totalAmount,
      orderNumber: counter.sequence,
      paymentStatus: "PAID",
      status: "Pending",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Safely emit sockets only after transaction is firmly committed
    if (io) {
      successfulUpdates.forEach(item => {
        io.emit("stock-updated", {
          itemId: item._id,
          newStock: item.stock,
        });
      });
    }

    res.status(201).json({ message: "Payment successful", order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };