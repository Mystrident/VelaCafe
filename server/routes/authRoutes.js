const express = require("express");

const router = express.Router();

const {
  loginAdmin,
  getPushPublicKey,
  subscribeToPushNotifications,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/login", loginAdmin);
router.get("/push-public-key", protect, getPushPublicKey);
router.post("/push-subscriptions", protect, subscribeToPushNotifications);

module.exports = router;
