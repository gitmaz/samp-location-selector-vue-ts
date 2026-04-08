import fs from 'fs';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../src/app.js';
import db, { closeDb } from '../../src/config/database.js';

describe('API integration', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM locations').run();
  });

  afterAll(() => {
    const p = process.env.TEST_SQLITE_PATH;
    closeDb();
    if (p && fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /api/locations returns an empty list initially', async () => {
    const res = await request(app).get('/api/locations').expect(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/locations creates a row when address is provided (no external geocode)', async () => {
    const body = {
      latitude: -33.8688,
      longitude: 151.2093,
      address: 'Test address, Sydney',
    };
    const res = await request(app).post('/api/locations').send(body).expect(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
    });
    expect(res.body.created_at).toBeDefined();
  });

  it('GET /api/locations returns all saved rows', async () => {
    await request(app)
      .post('/api/locations')
      .send({ latitude: -33.87, longitude: 151.21, address: 'First' })
      .expect(201);
    await request(app)
      .post('/api/locations')
      .send({ latitude: -33.88, longitude: 151.22, address: 'Second' })
      .expect(201);

    const res = await request(app).get('/api/locations').expect(200);
    expect(res.body).toHaveLength(2);
    const addresses = res.body.map((r: { address: string }) => r.address).sort();
    expect(addresses).toEqual(['First', 'Second']);
  });

  it('POST /api/locations validates coordinates', async () => {
    const res = await request(app)
      .post('/api/locations')
      .send({ latitude: 200, longitude: 0 })
      .expect(400);
    expect(res.body.errors).toBeDefined();
  });

  it('DELETE /api/locations/:id removes a row', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: -33.87, longitude: 151.21, address: 'To delete' })
      .expect(201);
    const id = created.body.id as number;

    await request(app).delete(`/api/locations/${id}`).expect(204);

    const list = await request(app).get('/api/locations').expect(200);
    expect(list.body).toEqual([]);
  });

  it('DELETE /api/locations/:id returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/locations/999999').expect(404);
    expect(res.body).toMatchObject({ message: 'Not found' });
  });

  it('GET /api/geocode/reverse returns address (fetch mocked)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ display_name: 'Mock Street, Sydney' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    try {
      const res = await request(app)
        .get('/api/geocode/reverse')
        .query({ lat: '-33.8688', lon: '151.2093' })
        .expect(200);
      expect(res.body).toEqual({ address: 'Mock Street, Sydney' });
    } finally {
      spy.mockRestore();
    }
  });
});
