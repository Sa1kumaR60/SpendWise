const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication API Endpoints', () => {
  const sampleUser = {
    name: 'College Student',
    email: 'student@example.com',
    password: 'Password123!',
    currency: 'USD',
  };

  it('should successfully register a new user and set HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(sampleUser.email);
    expect(res.body.user.name).toBe(sampleUser.name);
    expect(res.body).not.toHaveProperty('password');

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
  });

  it('should fail registration with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/register').send(sampleUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should fail registration with weak password (< 6 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  it('should successfully login and set auth cookie', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: sampleUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(sampleUser.email);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current logged in user with GET /api/auth/me', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(sampleUser.email);
  });

  it('should clear cookie on logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toMatch(/token=none/);
  });
});
