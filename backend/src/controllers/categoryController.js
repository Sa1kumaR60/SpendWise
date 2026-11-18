const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

/**
 * @route   GET /api/categories
 * @desc    Get all categories for the logged-in user
 * @access  Private
 */
const getCategories = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type && ['income', 'expense'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a new custom category for the user
 * @access  Private
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon } = req.body;

    const existing = await Category.findOne({
      user: req.user._id,
      name: new RegExp(`^${name.trim()}$`, 'i'),
      type,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A ${type} category named "${name.trim()}" already exists.`,
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      type,
      color: color || (type === 'income' ? '#16a34a' : '#dc2626'),
      icon: icon || 'tag',
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category (name, color, icon) with ownership verification
 * @access  Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const category = await Category.findOne({ _id: id, user: req.user._id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or you are not authorized to edit it.',
      });
    }

    if (name && name.trim() !== category.name) {
      const duplicate = await Category.findOne({
        user: req.user._id,
        name: new RegExp(`^${name.trim()}$`, 'i'),
        type: category.type,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another ${category.type} category with name "${name.trim()}" already exists.`,
        });
      }
      category.name = name.trim();
    }

    if (color) category.color = color;
    if (icon) category.icon = icon;

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category if not used in transactions/budgets
 * @access  Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, user: req.user._id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or you are not authorized to delete it.',
      });
    }

    // Check if category is used by existing transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      category: id,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it is currently used by ${transactionCount} transaction(s). Please delete or reassign those transactions first.`,
      });
    }

    // Check if used by budgets
    const budgetCount = await Budget.countDocuments({
      user: req.user._id,
      category: id,
    });

    if (budgetCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it has ${budgetCount} active monthly budget(s) configured. Delete the budget(s) first.`,
      });
    }

    await Category.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: `Category "${category.name}" was successfully deleted.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
