const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  // Each admin browser/device has its own Web Push subscription. Keeping
  // these on the admin record makes subscriptions durable across restarts.
  pushSubscriptions: [
    {
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Admin", adminSchema);
