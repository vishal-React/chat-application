const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
  maxAttempts: {
    type: Number,
    required: true,
  },
});
const otp = mongoose.model("otp", otpSchema);
module.exports = otp;
