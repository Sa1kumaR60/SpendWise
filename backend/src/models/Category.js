const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Category type must be either income or expense',
      },
    },
    color: {
      type: String,
      default: function () {
        return this.type === 'income' ? '#16a34a' : '#dc2626';
      },
      match: [/^#([0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color code'],
    },
    icon: {
      type: String,
      default: 'tag',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category name for the same user and type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
