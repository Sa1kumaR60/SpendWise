const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const { calculateBudgetStatus } = require('./budgetController');

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard metrics, charts, budget warnings, and recent activity
 * @access  Private
 */
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;

    // Target month YYYY-MM
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    // 1. Current Month Totals
    const currentMonthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    currentMonthTotals.forEach((t) => {
      if (t._id === 'income') {
        totalIncome = t.total;
        incomeCount = t.count;
      } else if (t._id === 'expense') {
        totalExpense = t.total;
        expenseCount = t.count;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // 2. Category Breakdown for Expenses in this month
    const categoryExpensesAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Populate category details
    const populatedCategories = await Category.populate(categoryExpensesAgg, {
      path: '_id',
      select: 'name color icon',
    });

    const categoryBreakdown = populatedCategories.map((item) => ({
      categoryId: item._id?._id || item._id,
      name: item._id?.name || 'Uncategorized',
      color: item._id?.color || '#dc2626',
      icon: item._id?.icon || 'tag',
      total: Math.round(item.total * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 100) : 0,
      count: item.count,
    }));

    // 3. 6-Month Income vs Expense Trend
    const sixMonthsAgo = new Date(Date.UTC(year, monthIndex - 5, 1));
    const trendAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Generate consecutive 6 months array
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(year, monthIndex - i, 1));
      const ym = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

      const incomeRow = trendAgg.find((r) => r._id.yearMonth === ym && r._id.type === 'income');
      const expenseRow = trendAgg.find((r) => r._id.yearMonth === ym && r._id.type === 'expense');

      const inc = incomeRow ? Math.round(incomeRow.total * 100) / 100 : 0;
      const exp = expenseRow ? Math.round(expenseRow.total * 100) / 100 : 0;

      monthlyTrend.push({
        month: ym,
        label: `${monthLabel} ${d.getUTCFullYear()}`,
        income: inc,
        expense: exp,
        net: Math.round((inc - exp) * 100) / 100,
      });
    }

    // 4. Budgets and alerts for this month
    const budgets = await calculateBudgetStatus(userId, targetMonth);
    const alertBudgets = budgets.filter((b) => b.status === 'warning' || b.status === 'exceeded');

    // 5. Recent 5 transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .populate('category', 'name color icon type')
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 6. Check if user has zero data
    const totalTransactionsEver = await Transaction.countDocuments({ user: userId });
    const isEmptyState = totalTransactionsEver === 0;

    return res.status(200).json({
      success: true,
      month: targetMonth,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate,
        transactionCount: incomeCount + expenseCount,
      },
      categoryBreakdown,
      monthlyTrend,
      budgets,
      alertBudgets,
      recentTransactions,
      isEmptyState,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardData };
