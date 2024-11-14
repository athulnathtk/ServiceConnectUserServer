const express = require('express');
const { signup, verifyOTP, resendOTP, signin } = require('../controllers/AuthController');
const { refreshAccessToken, fillUserProfile } = require('../controllers/TokenController');
const { verifyAccessToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/signin', signin);
router.post('/refresh-access-token', refreshAccessToken);
router.post('fill-your-profile', verifyAccessToken, fillUserProfile)

module.exports = router;
