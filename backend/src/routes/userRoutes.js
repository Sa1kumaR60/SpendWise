const express = require('express');
const { body } = require('express-validator');
const { updateProfile, updatePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'])
      .withMessage('Unsupported currency code'),
    body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
    validate,
  ],
  updateProfile
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  updatePassword
);

module.exports = router;
