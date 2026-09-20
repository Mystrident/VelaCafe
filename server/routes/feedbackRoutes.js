const express = require("express");
const { createFeedback, getFeedbacks } = require("../controllers/feedbackController");
const protect = require("../middleware/authMiddleware");
const customerProtect = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/", protect, getFeedbacks);
router.post("/", customerProtect, createFeedback);

module.exports = router;
