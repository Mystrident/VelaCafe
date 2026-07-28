const mongoose = require("mongoose");

// Server-side snapshot of what a Razorpay order was created for.
// verify-payment reads items/amount from HERE, never from the client,
// so the payload cannot be tampered with while the user is paying.
const pendingPaymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    items: [
      {
        itemId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    // Stock for `items` above has already been decremented at the moment
    // this document was created (see createRazorpayOrder). This is the
    // BookMyShow-style "soft lock" — the reservation is only valid until
    // expiresAt. releaseExpiredReservations.js is responsible for putting
    // the stock back and deleting the document once it expires unpaid.
    // NOTE: we intentionally do NOT use a Mongo TTL index here. A raw TTL
    // index deletes the document directly at the DB layer with no
    // application code involved, which would silently drop the reservation
    // WITHOUT restoring stock. The cron job is what safely reverses both.
    expiresAt: {
      type: Date,
      required: true,
    },

    // Set by releaseExpiredReservations.js once it has put the stock back
    // for an unpaid, timed-out reservation. We keep the (now-released)
    // document around for a while instead of deleting it immediately, so
    // that if a payment completes RIGHT as it expires, verifyPayment can
    // still find a record of what was being bought and flag it for a
    // manual refund, instead of the money silently vanishing with no
    // trace of what it was for.
    released: {
      type: Boolean,
      default: false,
    },
    releasedAt: {
      type: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
);

pendingPaymentSchema.index({ expiresAt: 1 });
pendingPaymentSchema.index({ released: 1, releasedAt: 1 });

module.exports = mongoose.model("PendingPayment", pendingPaymentSchema);
