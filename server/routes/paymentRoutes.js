const express = require("express");

const customerProtect = require("../middleware/customerAuthMiddleware");

const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { validateOrder } = require("../middleware/validators");

router.post("/create-order", validateOrder, createRazorpayOrder);

router.post(
  "/verify-payment",
  customerProtect,
  verifyPayment
);

module.exports = router;
