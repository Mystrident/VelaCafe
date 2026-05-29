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
      return res.status(400).json({
        message: "No items provided",
      });
    }

    let totalAmount = 0;

    const validatedItems = [];

    for (const cartItem of items) {
      const item = await Item.findById(cartItem.itemId);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      const quantity = Number(cartItem.quantity);

      if (!quantity || quantity < 1 || quantity > 50) {
        return res.status(400).json({
          message: "Invalid quantity",
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

    res.json({
      razorpayOrder,
      pickupTime,
      validatedItems,
      totalAmount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      pickupTime,
      items,
      totalAmount,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const counter = await Counter.findOneAndUpdate(
      {
        date: today,
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    const orderNumber = counter.sequence;

    const order = new Order({
      userId: user._id,

      userName: user.name,

      userEmail: user.email,

      orderDate: today,

      pickupTime,

      items,

      totalAmount,

      orderNumber,

      paymentStatus: "PAID",

      razorpayOrderId: razorpay_order_id,

      razorpayPaymentId: razorpay_payment_id,
    });

    await order.save();

    res.status(201).json({
      message: "Payment successful",
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
