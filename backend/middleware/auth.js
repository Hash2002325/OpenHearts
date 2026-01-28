const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - checks if user is logged in
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  // Format: "Bearer token_here"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (remove "Bearer " part)
      token = req.headers.authorization.split(' ')[1];

      // Verify token - makes sure it's valid and not expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (without password)
      // decoded.id contains the user's ID from when we created the token
      req.user = await User.findById(decoded.id).select('-password');

      // Continue to the next function (the actual route)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token was found
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is an admin
const admin = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, continue
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };