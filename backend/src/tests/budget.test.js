const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');
const Category = require('../models/Category');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Budget API and Calculation Endpoints', () => {
  let token;
  let expenseCategory;
  let incomeCategory;
  const currentMonth = new Date().toISOString().slice(0, 7);

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Budget Tester',
      email: 'budget@example.com',
      password: 'Password123!',
    });
    token = regRes.body.token;

    expenseCategory = await Category.findOne({
      user: regRes.body.user.id,
      type: 'expense',
    });

    incomeCategory = await Category.findOne({
      user: regRes.body.user.id,
      type: 'income',
    });
  });

  it('should create a budget for an expense category', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: expenseCategory._id,
        month: currentMonth,
        amount: 250,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.budget.amount).toBe(250);
    expect(res.body.budget.month).toBe(currentMonth);
  });

  it('should reject budget creation for income category', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: incomeCategory._id,
        month: currentMonth,
        amount: 300,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only be set for expense categories/i);
  });

  it('should reject duplicate budget for same category and month', async () => {
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: expenseCategory._id,
        month: currentMonth,
        amount: 200,
      });

    const dupRes = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: expenseCategory._id,
        month: currentMonth,
        amount: 250,
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toMatch(/already exists/i);
  });

  it('should calculate budget spent, remaining, percentage, and warning status correctly', async () => {
    // 1. Set budget of $100
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: expenseCategory._id,
        month: currentMonth,
        amount: 100,
      });

    // 2. Add an expense of $85 (85% -> warning status)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 85,
        type: 'expense',
        category: expenseCategory._id,
        date: new Date().toISOString(),
        description: 'Large purchase near budget limit',
      });

    // 3. Query budgets
    const listRes = await request(app)
      .get(`/api/budgets?month=${currentMonth}`)
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    const targetBudget = listRes.body.budgets[0];
    expect(targetBudget.spent).toBe(85);
    expect(targetBudget.remaining).toBe(15);
    expect(targetBudget.percentage).toBe(85);
    expect(targetBudget.status).toBe('warning');

    // 4. Add another $25 expense (total $110 -> 110% -> exceeded status)
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 25,
        type: 'expense',
        category: expenseCategory._id,
        date: new Date().toISOString(),
        description: 'Exceeding budget purchase',
      });

    const exceededRes = await request(app)
      .get(`/api/budgets?month=${currentMonth}`)
      .set('Authorization', `Bearer ${token}`);

    const exceededBudget = exceededRes.body.budgets[0];
    expect(exceededBudget.spent).toBe(110);
    expect(exceededBudget.remaining).toBe(-10);
    expect(exceededBudget.percentage).toBe(110);
    expect(exceededBudget.status).toBe('exceeded');
  });
});
