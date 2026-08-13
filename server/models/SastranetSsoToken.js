const mongoose = require("mongoose");

// Records Sastranet JWT ids until their expiry.  The unique index makes a JWT
// one-time use even if two requests race, and MongoDB's TTL index removes old
// records automatically.
const sastranetSsoTokenSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },
});

module.exports = mongoose.model("SastranetSsoToken", sastranetSsoTokenSchema);
