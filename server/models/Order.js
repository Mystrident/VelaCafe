const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    department: {
      type: String,
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

    paymentScreenshot: {
      type: String,
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
