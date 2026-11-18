const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // All transaction routes require authentication

router.get('/', getTransactions);
router.get('/export/csv', exportTransactionsCsv);
router.get('/:id', getTransactionById);

router.post(
  '/',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('date').optional().isISO8601().withMessage('Valid date format required'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
    validate,
  ],
  createTransaction
);

router.put(
  '/:id',
  [
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').optional().isMongoId().withMessage('Valid category ID required'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty').isLength({ max: 200 }),
    body('date').optional().isISO8601().withMessage('Valid date format required'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
    validate,
  ],
  updateTransaction
);

router.delete('/:id', deleteTransaction);

module.exports = router;
