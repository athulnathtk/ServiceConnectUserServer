const express = require('express');
const { signup, verifyOtp, resendOtp, signin } = require('../controllers/AuthController');
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/signin', signin);

module.exports = router;
