// user.integration.test.js
import request from 'supertest';
import app from './app.js';
import db from './db.js';

describe('GET /users/:id (integration)', () => {

  beforeAll(async () => {
    // setup test DB (or seed data)
    await db.connect();
    await db.seed([
      { id: 1, name: 'John Doe' }
    ]);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should return user if exists', async () => {
    const res = await request(app)
      .get('/users/1')
      .expect(200);

    expect(res.body).toEqual({
      id: 1,
      name: 'John Doe'
    });
  });

  it('should return 404 if user not found', async () => {
    const res = await request(app)
      .get('/users/999')
      .expect(404);

    expect(res.body).toEqual({
      error: 'Not found'
    });
  });
});