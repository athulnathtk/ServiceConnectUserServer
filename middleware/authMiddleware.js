const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Access token is required' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // Attach user info to request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired access token' });
  }
};
