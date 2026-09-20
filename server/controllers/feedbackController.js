const Feedback = require("../models/Feedback");
const User = require("../models/User");

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .select("name email feedback createdAt userId")
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(
      feedbacks.map((entry) => ({
        _id: entry._id,
        name: entry.name,
        email: entry.email || entry.userId?.email || "",
        feedback: entry.feedback,
        createdAt: entry.createdAt,
      })),
    );
  } catch (error) {
    console.error("Failed to load feedback:", error);
    res.status(500).json({ message: "Could not load feedback" });
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
      feedback: savedFeedback,
    });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    res.status(500).json({ message: "Could not save feedback" });
  }
};

module.exports = { createFeedback, getFeedbacks };
