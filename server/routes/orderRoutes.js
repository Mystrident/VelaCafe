const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const upload = require("../middleware/upload");

const protect = require("../middleware/authMiddleware");

router.post("/", upload.single("paymentScreenshot"), createOrder);

router.get("/", protect, getOrders);

router.patch("/:id", protect, updateOrderStatus);

module.exports = router;
