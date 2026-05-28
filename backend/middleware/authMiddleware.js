const jwt = require('jsonwebtoken');
const { readDB } = require('../config/db');

// Protect routes - JWT verification & active status guard (file-based)
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'avidus_super_secret_jwt_token_key_12345');

      // Query local JSON database instead of MongoDB
      const db = readDB();
      const user = db.users.find(u => u.id === decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check if user status is Inactive
      if (user.status === 'Inactive') {
        return res.status(403).json({ success: false, message: 'Access denied. Your account is currently inactive. Please contact an admin.' });
      }

      // Attach user object to request (excluding password for security)
      const { password, ...safeUser } = user;
      req.user = safeUser;

      next();
    } catch (error) {
      console.error('Middleware JWT Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Admin only permission gate
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized. Admin access required.' });
  }
};

module.exports = { protect, admin };
