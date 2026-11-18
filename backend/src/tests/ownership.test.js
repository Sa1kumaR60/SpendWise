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

describe('Ownership Protection and Data Isolation', () => {
  let userAToken;
  let userBToken;
  let userACategory;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      password: 'Password123!',
    });
    userAToken = resA.body.token;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User Beta',
      email: 'beta@example.com',
      password: 'Password123!',
    });
    userBToken = resB.body.token;

    // Find User A's expense category
    userACategory = await Category.findOne({
      user: resA.body.user.id,
      type: 'expense',
    });
  });

  it('should reject unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent User B from viewing or accessing User A transactions', async () => {
    // User A creates a transaction
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 150.0,
        type: 'expense',
        category: userACategory._id,
        description: 'Alpha secret purchase',
      });

    const transactionId = createRes.body.transaction._id;

    // User B tries to get it by ID
    const getRes = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(getRes.status).toBe(404);

    // User B lists transactions
    const listRes = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(listRes.body.transactions.length).toBe(0);
  });

  it('should prevent User B from modifying or deleting User A transactions', async () => {
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 80.0,
        type: 'expense',
        category: userACategory._id,
        description: 'Alpha coffee',
      });

    const transactionId = createRes.body.transaction._id;

    // User B attempts to edit User A's transaction
    const editRes = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ amount: 999.0, description: 'Hacked by Beta' });

    expect(editRes.status).toBe(404);

    // User B attempts to delete User A's transaction
    const deleteRes = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(deleteRes.status).toBe(404);
  });
});
