const express = require('express');
const { body } = require('express-validator');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBudgets);

router.post(
  '/',
  [
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('month').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must be in YYYY-MM format (e.g. 2026-11)'),
    body('amount').isFloat({ min: 1 }).withMessage('Budget limit must be at least 1'),
    validate,
  ],
  createBudget
);

router.put(
  '/:id',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Budget limit must be at least 1'),
    validate,
  ],
  updateBudget
);

router.delete('/:id', deleteBudget);

module.exports = router;
