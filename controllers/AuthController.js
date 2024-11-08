const User = require('../models/Otp');
const OTP = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  console.log(`OTP for ${email}: ${otp}`); // Logs the OTP to the console
};

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();

    const otpCode = generateOTP();
    const otp = new OTP({
      userId: user._id,
      otp: otpCode,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
    });
    await otp.save();

    await sendOTP(email, otpCode); // Logs the OTP to the console
    res.status(200).json({ message: 'Signup successful. Please verify your email with the OTP sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otpRecord = await OTP.findOne({ userId: user._id, otp });
    if (!otpRecord || otpRecord.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    await user.save();

    await OTP.deleteMany({ userId: user._id }); // Clean up OTPs for this user

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otpCode = generateOTP();
    const otp = new OTP({
      userId: user._id,
      otp: otpCode,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });
    await otp.save();

    await sendOTP(email, otpCode); // Logs the OTP to the console
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your account first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Signin successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
