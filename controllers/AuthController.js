const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Helper function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  });
};

// Signup
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await User.create({
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });
    await sendOtpEmail(email, otp);
    res.status(201).json({ message: 'User registered. Please verify OTP sent to your email.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (user && user.otp === otp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.json({ message: 'User verified successfully.' });
  } else {
    res.status(400).json({ message: 'Invalid or expired OTP.' });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user && !user.isVerified) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOtpEmail(email, newOtp);
    res.json({ message: 'OTP resent to your email.' });
  } else {
    res.status(400).json({ message: 'User not found or already verified.' });
  }
};

// Sign In
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isVerified) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Sign-in successful.', token });
    } else {
      res.status(400).json({ message: 'Please verify your account first.' });
    }
  } else {
    res.status(400).json({ message: 'Invalid credentials.' });
  }
};
