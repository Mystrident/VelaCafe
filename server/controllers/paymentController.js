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
  return new Date()
    .toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/")
    .reverse()
    .join("-"); // Formats to YYYY-MM-DD
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
        { new: true, session },
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
        io.emit("stock-updated", {
          itemId: v.itemId,
          newStock: v.stockAfterReservation,
        });
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
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
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
        { new: true },
      );
      if (io && restored) {
        io.emit("stock-updated", { itemId, newStock: restored.stock });
      }
    } catch (err) {
      // Don't let one bad item stop the rest of the release from running.
      console.error(
        `Failed to release reserved stock for item ${itemId}:`,
        err,
      );
    }
  }
};

// The single place that turns a PendingPayment into a real Order. Called
// from TWO independent triggers: (1) verifyPayment, when the customer's
// browser calls back after Razorpay's checkout succeeds, and (2) the
// Razorpay webhook, which fires server-to-server regardless of whether the
// customer's browser is even still open. Either one might arrive first, or
// only one might arrive at all (browser closed before it could call back) —
// this function is safe to call from both, any number of times, for the
// same payment.
//
// Idempotency is enforced two ways: an in-app check (does an Order for this
// razorpayOrderId already exist?) AND a DB-level unique index on
// Order.razorpayOrderId as the real guarantee against a race where both
// triggers reach this function at almost the same instant.
const finalizePendingPayment = async (razorpayOrderId, razorpayPaymentId) => {
  const existingOrder = await Order.findOne({ razorpayOrderId });
  if (existingOrder) {
    return { status: "already_processed", order: existingOrder };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pending = await PendingPayment.findOne({ razorpayOrderId }, null, {
      session,
    });

    if (!pending) {
      await session.abortTransaction();
      session.endSession();
      return { status: "not_found" };
    }

    // Use the user recorded on the reservation itself, not req.user — the
    // webhook trigger has no authenticated request at all, so pending.userId
    // is the only reliable source of who this payment belongs to.
    const user = await User.findById(pending.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return { status: "user_not_found" };
    }

    const today = getLocalDate();
    const counter = await Counter.findOneAndUpdate(
      { date: today },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, session },
    );

    await PendingPayment.deleteOne({ _id: pending._id }, { session });

    // If the reservation had already expired and been released (stock
    // given back to the pool) by the time payment landed, we can no longer
    // honor it — flag for a manual refund instead of silently losing track
    // of captured money.
    const order = new Order({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      orderDate: today,
      pickupTime: pending.pickupTime,
      items: pending.items,
      totalAmount: pending.totalAmount,
      orderNumber: counter.sequence,
      paymentStatus: pending.released ? "REFUND_REQUIRED" : "PAID",
      status: "Pending",
      razorpayOrderId,
      razorpayPaymentId,
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return {
      status: pending.released ? "refund_required" : "paid",
      order,
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    // A duplicate-key error on razorpayOrderId means the OTHER trigger
    // (webhook vs. client callback) finalized this exact payment a moment
    // before us — that's a success, not a failure. Fetch and return what
    // it created instead of erroring out.
    if (error.code === 11000) {
      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        return { status: "already_processed", order };
      }
    }
    throw error;
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
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
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const result = await finalizePendingPayment(
      razorpay_order_id,
      razorpay_payment_id,
    );

    if (result.status === "not_found") {
      return res.status(400).json({
        message: "No matching payment found or it was already processed",
      });
    }
    if (result.status === "user_not_found") {
      return res.status(404).json({ message: "User not found" });
    }

    // Defense in depth: the signature check already proves this is a
    // legitimate Razorpay callback, but confirm the resulting order
    // actually belongs to whoever is logged in and making this request,
    // so one customer's browser can't fetch another's order details by
    // guessing/replaying a razorpay_order_id.
    if (result.order.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "This payment does not belong to your account" });
    }

    if (result.order.paymentStatus === "REFUND_REQUIRED") {
      return res.status(201).json({
        message:
          "Payment successful, but your reservation timed out while you were paying and the item(s) went back on sale. Please see the cafe admin for a refund.",
        order: result.order,
        warning: true,
      });
    }

    res
      .status(201)
      .json({ message: "Payment successful", order: result.order });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

// Razorpay calls this directly, server-to-server, whenever a payment is
// captured — independent of whether the customer's browser is still open,
// still online, or ever called /verify-payment at all. This is what closes
// the "paid but stuck in PendingPayments" gap: even if the client-side
// callback never arrives, this will.
const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).json({ message: "Missing webhook signature" });
    }

    // req.body is the raw request Buffer here, not parsed JSON — see
    // server.js, where this route is mounted with express.raw() instead of
    // express.json(). The signature is computed over the exact raw bytes
    // Razorpay sent; re-serializing a parsed object would not reliably
    // reproduce the same bytes.
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && payment?.id) {
        const result = await finalizePendingPayment(
          payment.order_id,
          payment.id,
        );
        console.log(
          `[razorpay webhook] payment.captured for order ${payment.order_id}: ${result.status}`,
        );
      }
    }
    // Any other event type: acknowledge without acting on it. Razorpay
    // sends many event types (order.paid, payment.failed, etc.) — silently
    // ack anything we don't specifically handle rather than error, or
    // Razorpay will keep retrying delivery.

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    // A non-2xx here makes Razorpay retry delivery later, which is exactly
    // what we want for a transient failure on our end (DB hiccup, etc.) —
    // the payment itself is already safely captured on Razorpay's side
    // either way.
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
module.exports = {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
  finalizePendingPayment,
};
