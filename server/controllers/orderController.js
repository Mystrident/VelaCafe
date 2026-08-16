const Order = require("../models/Order");

const getKolkataDate = () =>
  new Date()
    .toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/")
    .reverse()
    .join("-");

const getPagination = (query) => {
  const pageValue = Number.parseInt(query.page, 10);
  const limitValue = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit =
    Number.isInteger(limitValue) && limitValue > 0
      ? Math.min(limitValue, 100)
      : 20;

  return { page, limit, skip: (page - 1) * limit };
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderDate: getKolkataDate() }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(),
    ]);

    res.json({
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
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
    const io = req.app.get("io");
    io.to(order._id.toString()).emit("order-status-updated", {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

// Lets a logged-in customer pull the CURRENT status of one of their own
// orders on demand. The tracker widget (StatusModal.jsx) otherwise only
// learns about status changes via a live Socket.IO event, which means a
// page refresh, a dropped connection, or simply opening the tracker after
// the update already fired leaves it stuck showing stale/cached data
// forever. This endpoint gives the frontend a way to sync to the real
// state on mount and after any reconnect.
const getCustomerOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
      
    }).select("status orderNumber _id items");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const getCustomerOrderHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { userId: req.user.id };
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select(
          "orderDate pickupTime items totalAmount orderNumber paymentStatus status createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
  getOrders,
  getOrderHistory,
  updateOrderStatus,
  getCustomerOrderStatus,
  getCustomerOrderHistory,
};
