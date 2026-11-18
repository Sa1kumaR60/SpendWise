const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Salary', type: 'income', color: '#16a34a', icon: 'briefcase', isDefault: true },
  { name: 'Freelance & Part-time', type: 'income', color: '#059669', icon: 'laptop', isDefault: true },
  { name: 'Investments', type: 'income', color: '#0d9488', icon: 'trending-up', isDefault: true },
  { name: 'Gifts & Allowance', type: 'income', color: '#10b981', icon: 'gift', isDefault: true },
  { name: 'Other Income', type: 'income', color: '#34d399', icon: 'plus-circle', isDefault: true },

  // Expense categories
  { name: 'Food & Dining', type: 'expense', color: '#dc2626', icon: 'utensils', isDefault: true },
  { name: 'Housing & Rent', type: 'expense', color: '#e11d48', icon: 'home', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#ea580c', icon: 'car', isDefault: true },
  { name: 'Education & Supplies', type: 'expense', color: '#7c3aed', icon: 'book', isDefault: true },
  { name: 'Utilities & Bills', type: 'expense', color: '#d97706', icon: 'zap', isDefault: true },
  { name: 'Entertainment & Leisure', type: 'expense', color: '#db2777', icon: 'film', isDefault: true },
  { name: 'Health & Personal Care', type: 'expense', color: '#2563eb', icon: 'activity', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#9333ea', icon: 'shopping-bag', isDefault: true },
  { name: 'Other Expenses', type: 'expense', color: '#64748b', icon: 'tag', isDefault: true },
];

const seedDefaultCategoriesForUser = async (userId) => {
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    user: userId,
  }));
  return Category.insertMany(categoriesToInsert);
};

module.exports = {
  DEFAULT_CATEGORIES,
  seedDefaultCategoriesForUser,
};
