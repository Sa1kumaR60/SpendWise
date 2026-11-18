const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { seedDefaultCategoriesForUser } = require('../utils/defaultCategories');

// Helper to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'spendwise_dev_secret_key_987654321_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to send HTTP-only cookie and JSON response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token, // Also return token for test runners or non-browser clients
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      theme: user.theme,
    },
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, seed categories, set cookie
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'USD',
    });

    // Seed default categories for this user
    try {
      await seedDefaultCategoriesForUser(user._id);
    } catch (catErr) {
      console.error('Error seeding initial categories:', catErr);
    }

    return sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Log in with email & password, set cookie
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookie
 * @access  Public
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user info
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency,
      theme: req.user.theme,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
