const express = require("express");
const router = express.Router();
const {
  getOrders,
  updateOrderStatus,
  getCustomerOrderStatus,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const customerProtect = require("../middleware/customerAuthMiddleware");
const { validateObjectId } = require("../middleware/validators");

router.get("/", protect, getOrders);
router.get(
  "/customer/:id/status",
  customerProtect,
  validateObjectId,
  getCustomerOrderStatus,
);
router.patch("/:id", protect, validateObjectId, updateOrderStatus);

module.exports = router;
