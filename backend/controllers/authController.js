const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../middleware/activityLogger');

// Helper to generate JWT token
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

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user. Limit role assignment (only 'User' or 'Admin' if supplied, defaulting to 'User')
    const userRole = role && ['Admin', 'User'].includes(role) ? role : 'User';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      status: 'Active' // Default to Active
    });

    if (user) {
      // Log auto-login activity during registration
      await logActivity(
        user._id,
        user.email,
        user.role,
        'Login',
        `User registered and logged in automatically`,
        req
      );

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
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

    // Find user by email and select password explicitly (since select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is Inactive
    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Access denied. Your account is currently inactive. Please contact an admin.' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Log login activity
    await logActivity(
      user._id,
      user.email,
      user.role,
      'Login',
      `User logged in successfully`,
      req
    );

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
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
    // req.user is set by authMiddleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
