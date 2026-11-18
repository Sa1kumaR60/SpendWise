const User = require('../models/User');

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (name, currency, theme)
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, theme } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (currency) user.currency = currency;
    if (theme) user.theme = theme;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  updatePassword,
};
