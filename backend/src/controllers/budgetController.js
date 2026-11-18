const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

/**
 * Helper to compute spending for budgets in a month
 */
const calculateBudgetStatus = async (userId, month) => {
  // Parse month bounds (e.g., '2026-11' -> start: 2026-11-01T00:00:00Z, end: 2026-11-30T23:59:59.999Z)
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

  const startDate = new Date(Date.UTC(year, monthIndex, 1));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

  // Find all budgets for this month
  const budgets = await Budget.find({ user: userId, month })
    .populate('category', 'name color icon type')
    .sort({ amount: -1 });

  // Aggregate spending per category for this month
  const spendingAgg = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: '$amount' },
      },
    },
  ]);

  const spendingMap = {};
  spendingAgg.forEach((item) => {
    spendingMap[item._id.toString()] = item.totalSpent;
  });

  return budgets.map((b) => {
    const categoryId = b.category?._id?.toString() || b.category?.toString();
    const spent = spendingMap[categoryId] || 0;
    const remaining = b.amount - spent;
    const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

    let status = 'normal'; // < 80%
    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      _id: b._id,
      month: b.month,
      limit: b.amount,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentage,
      status, // 'normal' | 'warning' | 'exceeded'
      category: b.category,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  });
};

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets for a given month with spent calculation
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query;
    // Default to current month YYYY-MM
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const budgetsWithStatus = await calculateBudgetStatus(req.user._id, targetMonth);

    // Calculate overall monthly budget summary
    const totalBudget = budgetsWithStatus.reduce((acc, b) => acc + b.limit, 0);
    const totalSpent = budgetsWithStatus.reduce((acc, b) => acc + b.spent, 0);
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return res.status(200).json({
      success: true,
      month: targetMonth,
      totalBudget,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalRemaining: Math.round((totalBudget - totalSpent) * 100) / 100,
      overallPercentage,
      budgets: budgetsWithStatus,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/budgets
 * @desc    Create a monthly budget for an expense category
 * @access  Private
 */
const createBudget = async (req, res, next) => {
  try {
    const { category: categoryId, month, amount } = req.body;

    // Validate category
    const categoryDoc = await Category.findOne({ _id: categoryId, user: req.user._id });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected. Category must belong to your account.',
      });
    }

    if (categoryDoc.type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be set for expense categories.',
      });
    }

    // Check duplicate
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: categoryId,
      month,
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: `A budget for category "${categoryDoc.name}" in ${month} already exists. You can edit the existing budget instead.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category: categoryId,
      month,
      amount: parseFloat(amount),
    });

    const populated = await Budget.findById(budget._id).populate('category', 'name color icon type');

    return res.status(201).json({
      success: true,
      message: 'Monthly budget set successfully',
      budget: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update budget amount limit
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const budget = await Budget.findOne({ _id: id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
      });
    }

    if (amount !== undefined) {
      budget.amount = parseFloat(amount);
    }

    await budget.save();

    const populated = await Budget.findById(budget._id).populate('category', 'name color icon type');

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
      id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  calculateBudgetStatus,
};
