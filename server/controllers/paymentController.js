const crypto = require("crypto");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Item = require("../models/Item");
const User = require("../models/User");
const Counter = require("../models/Counter");
const PendingPayment = require("../models/PendingPayment");

// How long a stock reservation is held while the user is on the Razorpay
// checkout screen. Matches the "soft lock" window BookMyShow-style seat
// reservations use. Kept in sync with releaseExpiredReservations.js.
const RESERVATION_MINUTES = 10;

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
  const session = await mongoose.startSession();
  session.startTransaction();

  // Tracks what we've successfully decremented so far in this loop, so
  // that if a LATER item in the same cart fails, or the Razorpay API call
  // itself fails after the transaction commits, we have a clean list to
  // hand to the compensating-write helper below.
  const reservedSoFar = [];

  try {
    const { pickupTime, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No items provided" });
    }
    if (items.length > 30) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Too many items" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      if (!mongoose.isValidObjectId(cartItem.itemId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid item" });
      }

      const quantity = Number(cartItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid quantity" });
      }

      // Atomic reserve-on-select, same as a BookMyShow seat lock: stock is
      // taken NOW, before the user ever reaches the payment screen, not
      // after payment succeeds. This is the fix for the double-booking
      // race — the second buyer is blocked here, before paying anything.
      const item = await Item.findOneAndUpdate(
        {
          _id: cartItem.itemId,
          available: true,
          stock: { $gte: quantity },
        },
        { $inc: { stock: -quantity } },
        { new: true, session }
      );

      if (!item) {
        // Either the item doesn't exist/isn't available, or there isn't
        // enough stock left. Figure out which, just for a clearer message.
        const existing = await Item.findById(cartItem.itemId).session(session);
        await session.abortTransaction();
        session.endSession();

        if (!existing || !existing.available) {
          return res.status(404).json({ message: "Item not found" });
        }
        return res.status(400).json({
          message: `Oops! Only ${existing.stock} ${existing.name} left. Someone just bought the rest.`,
        });
      }

      reservedSoFar.push({ itemId: item._id, quantity });
      totalAmount += item.price * quantity;
      validatedItems.push({
        itemId: item._id,
        name: item.name,
        quantity,
        price: item.price,
        stockAfterReservation: item.stock,
      });
    }

    await session.commitTransaction();
    session.endSession();

    // Reuse the existing "stock-updated" event the frontend already
    // listens for (Home.jsx, admin/Admin.jsx), so every connected client's
    // stock display drops immediately when the reservation is made — not
    // just once the buyer finishes paying.
    const io = req.app.get("io");
    if (io) {
      validatedItems.forEach((v) => {
        io.emit("stock-updated", { itemId: v.itemId, newStock: v.stockAfterReservation });
      });
    }

    // From here on, stock is already committed to the database, so any
    // failure needs a manual compensating write to give it back.
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
    } catch (razorpayError) {
      await releaseReservedStock(reservedSoFar, io);
      throw razorpayError;
    }

    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

    try {
      await PendingPayment.create({
        razorpayOrderId: razorpayOrder.id,
        userId: req.user.id,
        pickupTime,
        items: validatedItems,
        totalAmount,
        expiresAt,
      });
    } catch (pendingError) {
      await releaseReservedStock(reservedSoFar, io);
      throw pendingError;
    }

    res.json({
      razorpayOrder,
      pickupTime,
      validatedItems,
      totalAmount,
      reservedUntil: expiresAt,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error(error);
    res.status(500).json({
      message: process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

// Compensating write: gives back stock that was reserved earlier in a
// request that ended up failing AFTER the reservation was already
// committed (e.g. Razorpay's API itself failed). Also used by the expiry
// cleanup job to release stock from abandoned/timed-out reservations.
const releaseReservedStock = async (reservedItems, io) => {
  for (const { itemId, quantity } of reservedItems) {
    try {
      const restored = await Item.findByIdAndUpdate(
        itemId,
        { $inc: { stock: quantity } },
        { new: true }
      );
      if (io && restored) {
        io.emit("stock-updated", { itemId, newStock: restored.stock });
      }
    } catch (err) {
      // Don't let one bad item stop the rest of the release from running.
      console.error(`Failed to release reserved stock for item ${itemId}:`, err);
    }
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

    // NOTE: stock is NOT touched here anymore. It was already atomically
    // reserved back in createRazorpayOrder, so there is nothing left to
    // check or decrement at this point — we're just finalizing the order
    // for a reservation that (as far as we know) is still held.
    const pending = await PendingPayment.findOne(
      { razorpayOrderId: razorpay_order_id, userId: req.user.id },
      null,
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

    // Generate Order Number safely
    const today = getLocalDate();
    const counter = await Counter.findOneAndUpdate(
      { date: today },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session }
    );

    // Edge case: the payment landed on our server just as the reservation
    // hit its expiry and releaseExpiredReservations.js already put the
    // stock back for someone else to buy. The money IS captured by
    // Razorpay, but we can no longer honor the reservation, so flag it
    // for a manual refund instead of silently losing track of the payment.
    if (pending.released) {
      await PendingPayment.deleteOne({ _id: pending._id }, { session });

      const orphanedOrder = new Order({
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
      await orphanedOrder.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message:
          "Payment successful, but your reservation timed out while you were paying and the item(s) went back on sale. Please see the cafe admin for a refund.",
        order: orphanedOrder,
        warning: true,
      });
    }

    await PendingPayment.deleteOne({ _id: pending._id }, { session });

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
