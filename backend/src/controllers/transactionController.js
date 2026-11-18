const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { transactionsToCsv } = require('../utils/csvHelper');

/**
 * @route   GET /api/transactions
 * @desc    Get filtered, sorted, paginated transactions for the logged-in user
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { user: req.user._id };

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Filter by text search (description or notes)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ description: regex }, { notes: regex }];
    }

    // Sort setup
    const sortField = ['date', 'amount', 'createdAt'].includes(sortBy) ? sortBy : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };
    if (sortField !== 'createdAt') {
      sortObj.createdAt = -1; // tie-breaker
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .populate('category', 'name type color icon')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction by ID
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, user: req.user._id })
      .populate('category', 'name type color icon');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category: categoryId, date, description, notes } = req.body;

    // Verify category belongs to user and matches transaction type
    const categoryDoc = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected. Category must belong to your account.',
      });
    }

    if (categoryDoc.type !== type) {
      return res.status(400).json({
        success: false,
        message: `Category "${categoryDoc.name}" is an ${categoryDoc.type} category, but transaction is marked as ${type}.`,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount: parseFloat(amount),
      type,
      category: categoryId,
      date: date ? new Date(date) : new Date(),
      description: description.trim(),
      notes: notes ? notes.trim() : '',
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('category', 'name type color icon');

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      transaction: populatedTransaction,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category: categoryId, date, description, notes } = req.body;

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.',
      });
    }

    const targetType = type || transaction.type;
    const targetCategoryId = categoryId || transaction.category;

    // If category or type changed, re-validate category ownership and type match
    if (categoryId || type) {
      const categoryDoc = await Category.findOne({ _id: targetCategoryId, user: req.user._id });
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected.',
        });
      }
      if (categoryDoc.type !== targetType) {
        return res.status(400).json({
          success: false,
          message: `Category "${categoryDoc.name}" does not match transaction type "${targetType}".`,
        });
      }
      transaction.category = targetCategoryId;
      transaction.type = targetType;
    }

    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description.trim();
    if (notes !== undefined) transaction.notes = notes.trim();

    await transaction.save();

    const updated = await Transaction.findById(transaction._id)
      .populate('category', 'name type color icon');

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/transactions/export/csv
 * @desc    Export filtered transactions to CSV
 * @access  Private
 */
const exportTransactionsCsv = async (req, res, next) => {
  try {
    const { search, type, category, startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ description: regex }, { notes: regex }];
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .sort({ date: -1, createdAt: -1 });

    const csvContent = transactionsToCsv(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="spendwise_transactions_${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
};
