const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  refreshToken: {type: String },
  profile: {
    name: String,
    phone: Number,
    dob: String,
    gender: String,
    address: String,
  },
});

module.exports = mongoose.model('User', userSchema);