const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Item = require("../models/Item");
const User = require("../models/User");
const Counter = require("../models/Counter");

const createRazorpayOrder = async (req, res) => {
  try {
    const { pickupTime, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Step 1: Pre-check stock before creating Razorpay intent
    for (const cartItem of items) {
      const item = await Item.findById(cartItem.itemId);

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const quantity = Number(cartItem.quantity);

      if (!quantity || quantity < 1 || quantity > 50) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      if (item.stock < quantity) {
        return res.status(400).json({ 
          message: `Oops! Only ${item.stock} ${item.name} left. Someone just bought the rest.` 
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
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
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
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pickupTime, items, totalAmount } = req.body;

    // 1. Verify Razorpay Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const io = req.app.get("io");
    let outOfStockDuringPayment = false;
    let failedItems = [];

    // 2. ATOMIC STOCK DEDUCTION (The Fix for Race Conditions)
    for (const purchasedItem of items) {
      // Find the item AND ensure it has enough stock in ONE atomic database operation
      const updatedItem = await Item.findOneAndUpdate(
        { 
          _id: purchasedItem.itemId, 
          stock: { $gte: purchasedItem.quantity } // CRITICAL: Only match if stock is enough
        },
        { $inc: { stock: -purchasedItem.quantity } }, // Instantly deduct
        { new: true }
      );

      if (!updatedItem) {
        // If updatedItem is null, it means someone else bought it during the 30 seconds 
        // the user was typing in their UPI pin on Razorpay!
        outOfStockDuringPayment = true;
        failedItems.push(purchasedItem.name);
      } else {
        // Broadcast the live update to all other connected screens
        if (io) {
          io.emit("stock-updated", { 
            itemId: updatedItem._id, 
            newStock: updatedItem.stock 
          });
        }
      }
    }

    // 3. Generate Order Number
    const today = new Date().toISOString().split("T")[0];
    const counter = await Counter.findOneAndUpdate(
      { date: today },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    // 4. Save the Order
    const order = new Order({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      orderDate: today,
      pickupTime,
      items,
      totalAmount,
      orderNumber: counter.sequence,
      // If stock ran out during payment, mark it for the Admin to refund!
      paymentStatus: outOfStockDuringPayment ? "REFUND_REQUIRED" : "PAID",
      status: outOfStockDuringPayment ? "Pending" : "Pending", // Admin can see it's special
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await order.save();

    // 5. Handle the Race Condition User Experience
    if (outOfStockDuringPayment) {
      return res.status(201).json({ 
        message: `Payment successful, but ${failedItems.join(", ")} sold out while you were paying. Please see the cafe admin for a refund.`, 
        order,
        warning: true
      });
    }

    res.status(201).json({ message: "Payment successful", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };