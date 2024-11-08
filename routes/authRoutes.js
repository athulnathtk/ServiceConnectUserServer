const express = require('express');
const { signup, verifyOTP, resendOTP, signin } = require('../controllers/AuthController');
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/signin', signin);

module.exports = router;
