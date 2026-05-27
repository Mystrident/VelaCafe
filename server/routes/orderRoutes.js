const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getOrders);

router.patch("/:id", protect, updateOrderStatus);

module.exports = router;
