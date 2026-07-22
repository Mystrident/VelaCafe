const express = require("express");
const router = express.Router();
const {
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validators");

router.get("/", protect, getOrders);
router.patch("/:id", protect, validateObjectId, updateOrderStatus);

module.exports = router;