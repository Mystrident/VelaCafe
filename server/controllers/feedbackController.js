const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

const serializeFeedback = (entry) => ({
  _id: entry._id,
  name: entry.name,
  email: entry.email || entry.userId?.email || "",
  feedback: entry.feedback,
  adminReply: entry.adminReply || "",
  repliedAt: entry.repliedAt || null,
  createdAt: entry.createdAt,
});

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .select("name email feedback adminReply repliedAt createdAt userId")
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(feedbacks.map(serializeFeedback));
  } catch (error) {
    console.error("Failed to load feedback:", error);
    res.status(500).json({ message: "Could not load feedback" });
  }
};

const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .select("feedback adminReply repliedAt createdAt")
      .sort({ createdAt: -1 });

    res.json(feedbacks.map(serializeFeedback));
  } catch (error) {
    console.error("Failed to load customer feedback:", error);
    res.status(500).json({ message: "Could not load your feedback" });
  }
};

const createFeedback = async (req, res) => {
  try {
    const feedback = typeof req.body.feedback === "string"
      ? req.body.feedback.trim()
      : "";

    if (!feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    if (feedback.length > 1000) {
      return res.status(400).json({ message: "Feedback must be 1000 characters or fewer" });
    }

    const user = await User.findById(req.user.id).select("name email sastranetUserId");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const savedFeedback = await Feedback.create({
      userId: user._id,
      email: user.email,
      name: user.name,
      feedback,
    });

    res.status(201).json({
      message: "Thank you for your feedback",
      feedback: serializeFeedback(savedFeedback),
    });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    res.status(500).json({ message: "Could not save feedback" });
  }
};

const replyToFeedback = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const reply = typeof req.body.reply === "string" ? req.body.reply.trim() : "";

    if (!reply) {
      return res.status(400).json({ message: "Reply is required" });
    }

    if (reply.length > 1000) {
      return res.status(400).json({ message: "Reply must be 1000 characters or fewer" });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply, repliedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Reply saved", feedback: serializeFeedback(feedback) });
  } catch (error) {
    console.error("Failed to reply to feedback:", error);
    res.status(500).json({ message: "Could not save reply" });
  }
};

module.exports = { createFeedback, getFeedbacks, getMyFeedbacks, replyToFeedback };
