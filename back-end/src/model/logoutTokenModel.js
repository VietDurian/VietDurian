const mongoose = require("mongoose");

const logoutTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for auto-expiry after 12 hours
logoutTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const LogoutToken = mongoose.model("LogoutToken", logoutTokenSchema);

module.exports = LogoutToken;
