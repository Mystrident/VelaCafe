const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getPublicKey,
  saveSubscription,
} = require("../services/pushNotificationService");

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const admin = await Admin.findOne({
      username,
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const getPushPublicKey = (req, res) => {
  const publicKey = getPublicKey();
  if (!publicKey) {
    return res.status(503).json({
      message: "Push notifications have not been configured on the server",
    });
  }
  return res.json({ publicKey });
};

const subscribeToPushNotifications = async (req, res) => {
  const subscription = req.body;
  if (
    !subscription ||
    typeof subscription.endpoint !== "string" ||
    !subscription.endpoint.startsWith("https://") ||
    typeof subscription.keys?.p256dh !== "string" ||
    typeof subscription.keys?.auth !== "string"
  ) {
    return res.status(400).json({ message: "Invalid push subscription" });
  }

  await saveSubscription(req.admin.id, subscription);
  return res.status(201).json({ message: "Push subscription saved" });
};

module.exports = {
  loginAdmin,
  getPushPublicKey,
  subscribeToPushNotifications,
};
