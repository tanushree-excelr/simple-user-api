const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Basic API checks', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });

  it('should require body for signup', async () => {
    const res = await request(app).post('/api/users/signup').send({});
    expect(res.statusCode).toBe(400);
  });
});
