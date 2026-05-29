const crypto = require("crypto");

const razorpay = require("../config/razorpay");

const Order = require("../models/Order");

const Item = require("../models/Item");

const User = require("../models/User");

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

  totalAmount += item.price * quantity;

  validatedItems.push({
    itemId: item._id,
    name: item.name,
    quantity,
    price: item.price,
  });
}

const options = {
  amount: totalAmount * 100,
  currency: "INR",
  receipt: `receipt_${Date.now()}`,
};

const razorpayOrder = await razorpay.orders.create(options);

res.json({
  razorpayOrder,
  pickupTime,
  validatedItems,
  totalAmount,
});


} catch (error) {
res.status(500).json({
message: error.message,
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
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest("hex");

const isAuthentic = generatedSignature === razorpay_signature;

if (!isAuthentic) {
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

const totalOrders = await Order.countDocuments();

const orderNumber = totalOrders + 1;

const order = new Order({
  userId: user._id,

  userName: user.name,

  userEmail: user.email,

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
res.status(500).json({
message: error.message,
});
}
};

module.exports = {
createRazorpayOrder,
verifyPayment,
};
