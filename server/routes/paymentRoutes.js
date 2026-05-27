const express = require("express");

const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { validateOrder } = require("../middleware/validators");

router.post("/create-order", validateOrder, createRazorpayOrder);

router.post("/verify-payment", verifyPayment);

module.exports = router;
