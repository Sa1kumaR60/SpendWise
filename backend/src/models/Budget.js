const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required (YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount limit is required'],
      min: [1, 'Budget limit must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budget for the same user, category, and month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
