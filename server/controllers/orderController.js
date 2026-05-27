const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { customerName, department, pickupTime, items, totalAmount } =
      req.body;

    const order = new Order({
      customerName,
      department,
      pickupTime,
      items: JSON.parse(items),
      totalAmount,
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = ["Pending", "Preparing", "Ready", "Completed"];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = req.body.status;

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
