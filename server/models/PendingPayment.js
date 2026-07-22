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

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // auto-delete unpaid intents after 1 hour
    },
  },
);

module.exports = mongoose.model("PendingPayment", pendingPaymentSchema);
