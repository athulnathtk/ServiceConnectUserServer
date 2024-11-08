const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true },
  otpCreatedAt: { type: Date, default:Date.now },
  otpExpires: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
