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

describe('Transactions API Endpoints', () => {
  let token;
  let expenseCategory;
  let incomeCategory;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Transaction Tester',
      email: 'tester@example.com',
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

  it('should create an expense transaction successfully', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 45.5,
        type: 'expense',
        category: expenseCategory._id,
        date: new Date().toISOString(),
        description: 'Campus lunch with study group',
        notes: 'Split payment',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction.amount).toBe(45.5);
    expect(res.body.transaction.type).toBe('expense');
    expect(res.body.transaction.description).toBe('Campus lunch with study group');
  });

  it('should reject transaction when category type mismatches transaction type', async () => {
    // Attempting to record an income transaction with an expense category
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 200,
        type: 'income',
        category: expenseCategory._id,
        description: 'Mismatched transaction',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid amount <= 0', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: -50,
        type: 'expense',
        category: expenseCategory._id,
        description: 'Negative amount',
      });

    expect(res.status).toBe(400);
  });

  it('should support search, filtering, and pagination', async () => {
    // Create multiple transactions
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 100,
        type: 'expense',
        category: expenseCategory._id,
        description: 'Grocery shopping apples and oranges',
      });

    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500,
        type: 'income',
        category: incomeCategory._id,
        description: 'Freelance web development payment',
      });

    // Test text search
    const searchRes = await request(app)
      .get('/api/transactions?search=apples')
      .set('Authorization', `Bearer ${token}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.transactions.length).toBe(1);
    expect(searchRes.body.transactions[0].description).toMatch(/apples/);

    // Test type filter
    const typeRes = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${token}`);

    expect(typeRes.status).toBe(200);
    expect(typeRes.body.transactions.length).toBe(1);
    expect(typeRes.body.transactions[0].type).toBe('income');
  });

  it('should export filtered transactions to formatted RFC 4180 CSV', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 25.0,
        type: 'expense',
        category: expenseCategory._id,
        description: 'Coffee, "special" blend',
        notes: 'Contains commas, quotes, and notes',
      });

    const csvRes = await request(app)
      .get('/api/transactions/export/csv')
      .set('Authorization', `Bearer ${token}`);

    expect(csvRes.status).toBe(200);
    expect(csvRes.headers['content-type']).toMatch(/text\/csv/);
    expect(csvRes.text).toContain('Date');
    expect(csvRes.text).toContain('Coffee, ""special"" blend');
  });
});
