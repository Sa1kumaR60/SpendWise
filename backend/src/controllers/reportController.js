const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

/**
 * @route   GET /api/reports/summary
 * @desc    Comprehensive spending, income, and category analysis for reports page
 * @access  Private
 */
const getReportSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, year } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    } else {
      // Default to current year or selected year
      const targetYear = parseInt(year, 10) || new Date().getUTCFullYear();
      dateFilter = {
        $gte: new Date(Date.UTC(targetYear, 0, 1)),
        $lte: new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999)),
      };
    }

    const matchStage = {
      $match: {
        user: userId,
        date: dateFilter,
      },
    };

    // 1. Overall Income, Expense, Net Totals
    const totalsAgg = await Transaction.aggregate([
      matchStage,
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    let avgExpense = 0;

    totalsAgg.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = Math.round(item.total * 100) / 100;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpense = Math.round(item.total * 100) / 100;
        expenseCount = item.count;
        avgExpense = Math.round(item.avgAmount * 100) / 100;
      }
    });

    const netSavings = Math.round((totalIncome - totalExpense) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // 2. Category Breakdown for Expenses
    const expenseCatAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: dateFilter,
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

    const populatedExpenseCats = await Category.populate(expenseCatAgg, {
      path: '_id',
      select: 'name color icon',
    });

    const expenseCategories = populatedExpenseCats.map((item) => ({
      categoryId: item._id?._id || item._id,
      name: item._id?.name || 'Uncategorized',
      color: item._id?.color || '#dc2626',
      icon: item._id?.icon || 'tag',
      total: Math.round(item.total * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 100) : 0,
      count: item.count,
    }));

    // 3. Category Breakdown for Income
    const incomeCatAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'income',
          date: dateFilter,
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

    const populatedIncomeCats = await Category.populate(incomeCatAgg, {
      path: '_id',
      select: 'name color icon',
    });

    const incomeCategories = populatedIncomeCats.map((item) => ({
      categoryId: item._id?._id || item._id,
      name: item._id?.name || 'Uncategorized',
      color: item._id?.color || '#16a34a',
      icon: item._id?.icon || 'tag',
      total: Math.round(item.total * 100) / 100,
      percentage: totalIncome > 0 ? Math.round((item.total / totalIncome) * 100) : 0,
      count: item.count,
    }));

    // 4. Monthly Trend breakdown
    const monthlyAgg = await Transaction.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            yearMonth: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.yearMonth': 1 } },
    ]);

    // Group into month map
    const monthMap = {};
    monthlyAgg.forEach((row) => {
      const ym = row._id.yearMonth;
      if (!monthMap[ym]) {
        monthMap[ym] = { month: ym, income: 0, expense: 0, net: 0 };
      }
      if (row._id.type === 'income') {
        monthMap[ym].income = Math.round(row.total * 100) / 100;
      } else if (row._id.type === 'expense') {
        monthMap[ym].expense = Math.round(row.total * 100) / 100;
      }
      monthMap[ym].net = Math.round((monthMap[ym].income - monthMap[ym].expense) * 100) / 100;
    });

    const monthlyBreakdown = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        incomeCount,
        expenseCount,
        avgExpense,
        totalTransactions: incomeCount + expenseCount,
      },
      expenseCategories,
      incomeCategories,
      monthlyBreakdown,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReportSummary };
