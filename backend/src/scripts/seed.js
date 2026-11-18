require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { seedDefaultCategoriesForUser } = require('../utils/defaultCategories');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Beginning database seeding...');

    // Clear existing data
    console.log('Clearing existing users, categories, transactions, and budgets...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
    ]);

    // 1. Create Primary Demo User
    const demoUser = await User.create({
      name: 'Alex Chen (College Student)',
      email: 'demo@spendwise.edu',
      password: 'Password123!',
      currency: 'USD',
      theme: 'light',
    });

    // 2. Create Secondary User (for verifying ownership boundary)
    const secondUser = await User.create({
      name: 'Jordan Smith',
      email: 'jordan@spendwise.edu',
      password: 'Password123!',
      currency: 'USD',
      theme: 'light',
    });

    console.log(`Created primary user: ${demoUser.email} & second user: ${secondUser.email}`);

    // Seed default categories
    const demoCategories = await seedDefaultCategoriesForUser(demoUser._id);
    await seedDefaultCategoriesForUser(secondUser._id);

    console.log(`Seeded default categories for both users.`);

    // Map categories by name for easy reference
    const catMap = {};
    demoCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // Helper dates relative to now
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonthNum = now.getUTCMonth(); // 0-based

    const getDate = (monthOffset, dayOffset = 5) => {
      const d = new Date(Date.UTC(currentYear, currentMonthNum - monthOffset, dayOffset, 12, 0, 0));
      return d;
    };

    const getMonthString = (monthOffset) => {
      const d = new Date(Date.UTC(currentYear, currentMonthNum - monthOffset, 1));
      return d.toISOString().slice(0, 7);
    };

    const currentMonthStr = getMonthString(0);
    const lastMonthStr = getMonthString(1);
    const twoMonthsAgoStr = getMonthString(2);

    // 3. Transactions for Demo User
    const transactions = [
      // Current Month - Income
      {
        user: demoUser._id,
        category: catMap['Salary'],
        type: 'income',
        amount: 1850.0,
        date: getDate(0, 1),
        description: 'Tech Internship Stipend',
        notes: 'Monthly direct deposit from Summer/Fall campus internship',
      },
      {
        user: demoUser._id,
        category: catMap['Freelance & Part-time'],
        type: 'income',
        amount: 320.0,
        date: getDate(0, 8),
        description: 'CS Lab Peer Tutoring',
        notes: '16 hours tutoring Data Structures students',
      },
      {
        user: demoUser._id,
        category: catMap['Gifts & Allowance'],
        type: 'income',
        amount: 150.0,
        date: getDate(0, 12),
        description: 'Semester Book Allowance from Parents',
        notes: 'Support for required reference textbooks',
      },

      // Current Month - Expenses
      {
        user: demoUser._id,
        category: catMap['Housing & Rent'],
        type: 'expense',
        amount: 750.0,
        date: getDate(0, 2),
        description: 'Off-Campus Student Apartment Rent',
        notes: 'Split 3 ways with roommates',
      },
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        type: 'expense',
        amount: 86.45,
        date: getDate(0, 3),
        description: 'Weekly Grocery Haul at Trader Joe’s',
        notes: 'Oats, milk, eggs, pasta, fruits and vegetables',
      },
      {
        user: demoUser._id,
        category: catMap['Utilities & Bills'],
        type: 'expense',
        amount: 54.2,
        date: getDate(0, 4),
        description: 'High-speed Fiber Internet Bill',
        notes: 'Apartment WiFi share',
      },
      {
        user: demoUser._id,
        category: catMap['Transportation'],
        type: 'expense',
        amount: 45.0,
        date: getDate(0, 5),
        description: 'Monthly Campus Metro Pass',
        notes: 'Student transit pass discount applied',
      },
      {
        user: demoUser._id,
        category: catMap['Education & Supplies'],
        type: 'expense',
        amount: 112.5,
        date: getDate(0, 6),
        description: 'Algorithms & Discrete Math Textbooks',
        notes: 'Bought second-hand from university bookstore',
      },
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        type: 'expense',
        amount: 42.8,
        date: getDate(0, 9),
        description: 'Campus Coffee & Study Snacks with Team',
        notes: 'Study session for midterm exam prep',
      },
      {
        user: demoUser._id,
        category: catMap['Entertainment & Leisure'],
        type: 'expense',
        amount: 68.0,
        date: getDate(0, 10),
        description: 'College Cinema & Bowling Night',
        notes: 'Friday night outing with hallmates',
      },
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        type: 'expense',
        amount: 94.3,
        date: getDate(0, 11),
        description: 'Mid-month Grocery Top-up',
        notes: 'Fresh produce, chicken, pantry staples',
      },
      {
        user: demoUser._id,
        category: catMap['Health & Personal Care'],
        type: 'expense',
        amount: 28.5,
        date: getDate(0, 13),
        description: 'Campus Health Center Prescription & Vitamins',
        notes: 'Seasonal flu care',
      },

      // Last Month - Income & Expenses (for trends)
      {
        user: demoUser._id,
        category: catMap['Salary'],
        type: 'income',
        amount: 1850.0,
        date: getDate(1, 1),
        description: 'Tech Internship Stipend',
        notes: 'Direct deposit',
      },
      {
        user: demoUser._id,
        category: catMap['Freelance & Part-time'],
        type: 'income',
        amount: 450.0,
        date: getDate(1, 15),
        description: 'Website Development for Local Bakery',
        notes: 'React landing page freelance project',
      },
      {
        user: demoUser._id,
        category: catMap['Housing & Rent'],
        type: 'expense',
        amount: 750.0,
        date: getDate(1, 2),
        description: 'Apartment Rent',
        notes: 'Monthly rent check',
      },
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        type: 'expense',
        amount: 295.0,
        date: getDate(1, 14),
        description: 'Monthly Groceries & Dining Out',
        notes: 'Groceries and campus cafeteria',
      },
      {
        user: demoUser._id,
        category: catMap['Transportation'],
        type: 'expense',
        amount: 45.0,
        date: getDate(1, 6),
        description: 'Monthly Metro Pass',
        notes: 'Subway pass',
      },
      {
        user: demoUser._id,
        category: catMap['Entertainment & Leisure'],
        type: 'expense',
        amount: 135.0,
        date: getDate(1, 18),
        description: 'Weekend Concert Tickets & Rideshare',
        notes: 'Campus music festival',
      },
      {
        user: demoUser._id,
        category: catMap['Shopping'],
        type: 'expense',
        amount: 79.99,
        date: getDate(1, 22),
        description: 'Ergonomic Desk Lamp & Study Supplies',
        notes: 'Exam study room setup',
      },

      // Two Months Ago
      {
        user: demoUser._id,
        category: catMap['Salary'],
        type: 'income',
        amount: 1800.0,
        date: getDate(2, 1),
        description: 'Tech Internship Stipend',
        notes: 'Monthly stipend',
      },
      {
        user: demoUser._id,
        category: catMap['Housing & Rent'],
        type: 'expense',
        amount: 750.0,
        date: getDate(2, 2),
        description: 'Apartment Rent',
        notes: 'Monthly rent',
      },
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        type: 'expense',
        amount: 260.0,
        date: getDate(2, 16),
        description: 'Groceries & Dining',
        notes: 'Costco & campus dining',
      },
      {
        user: demoUser._id,
        category: catMap['Education & Supplies'],
        type: 'expense',
        amount: 85.0,
        date: getDate(2, 10),
        description: 'Lab Notebook & Course Software License',
        notes: 'Required lab supplies',
      },
    ];

    await Transaction.insertMany(transactions);
    console.log(`Inserted ${transactions.length} sample transactions for demo user.`);

    // 4. Budgets for Demo User
    const budgets = [
      // Current Month Budgets (Food has spent $223.55 of $300 -> 75% warning near limit!)
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        month: currentMonthStr,
        amount: 300.0,
      },
      // Housing budget
      {
        user: demoUser._id,
        category: catMap['Housing & Rent'],
        month: currentMonthStr,
        amount: 750.0,
      },
      // Transportation budget
      {
        user: demoUser._id,
        category: catMap['Transportation'],
        month: currentMonthStr,
        amount: 60.0,
      },
      // Entertainment budget ($68 spent of $60 -> Exceeded! Shows red warning card)
      {
        user: demoUser._id,
        category: catMap['Entertainment & Leisure'],
        month: currentMonthStr,
        amount: 60.0,
      },
      // Education budget
      {
        user: demoUser._id,
        category: catMap['Education & Supplies'],
        month: currentMonthStr,
        amount: 150.0,
      },

      // Last Month Budgets
      {
        user: demoUser._id,
        category: catMap['Food & Dining'],
        month: lastMonthStr,
        amount: 320.0,
      },
      {
        user: demoUser._id,
        category: catMap['Housing & Rent'],
        month: lastMonthStr,
        amount: 750.0,
      },
      {
        user: demoUser._id,
        category: catMap['Entertainment & Leisure'],
        month: lastMonthStr,
        amount: 120.0,
      },
    ];

    await Budget.insertMany(budgets);
    console.log(`Inserted ${budgets.length} monthly budgets for demo user.`);

    console.log('========================================================');
    console.log(' SEEDING COMPLETE! SpendWise demo account is ready:');
    console.log('   Email:    demo@spendwise.edu');
    console.log('   Password: Password123!');
    console.log('========================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
