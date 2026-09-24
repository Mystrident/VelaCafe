const express = require("express");
const {
  createFeedback,
  getFeedbacks,
  getMyFeedbacks,
  replyToFeedback,
} = require("../controllers/feedbackController");
const protect = require("../middleware/authMiddleware");
const customerProtect = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/", protect, getFeedbacks);
router.get("/mine", customerProtect, getMyFeedbacks);
router.post("/", customerProtect, createFeedback);
router.patch("/:id/reply", protect, replyToFeedback);

module.exports = router;
