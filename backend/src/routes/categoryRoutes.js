const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All category routes require authentication

router.get('/', getCategories);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }).withMessage('Category name too long'),
    body('type').isIn(['income', 'expense']).withMessage('Category type must be income or expense'),
    body('color').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/).withMessage('Valid hex color code required'),
    validate,
  ],
  createCategory
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty').isLength({ max: 50 }),
    body('color').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/).withMessage('Valid hex color code required'),
    validate,
  ],
  updateCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;
