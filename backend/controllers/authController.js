const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

// Helper to generate JWT token based on file user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'avidus_super_secret_jwt_token_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all requested fields' });
    }

    const db = readDB();

    // Check if user already exists
    const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user object
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase().trim(),
      password, // Plain text passwords as requested for ultimate simplicity
      role: role && ['Admin', 'User'].includes(role) ? role : 'User',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    // Log auto-login activity
    await logActivity(
      newUser.id,
      newUser.email,
      newUser.role,
      'Login',
      `User registered and logged in automatically`,
      req
    );

    res.status(201).json({
      success: true,
      token: generateToken(newUser.id),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const db = readDB();

    // Find user by email
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password matching (simple plain-text comparison for absolute simplicity)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is Inactive
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Access denied. Your account is currently inactive. Please contact an admin.' });
    }

    // Log login activity
    await logActivity(
      user.id,
      user.email,
      user.role,
      'Login',
      `User logged in successfully`,
      req
    );

    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user was set by authMiddleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
