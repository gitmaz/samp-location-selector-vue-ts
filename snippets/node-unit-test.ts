import { getUser } from './userController';
import db from './db';

jest.mock('./db');

describe('getUser', () => {
  it('returns user if found', async () => {
    db.getUser.mockResolvedValue({ id: 1, name: 'John' });

    const req = { params: { id: 1 } };
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };

    await getUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'John' });
  });

  it('returns 404 if not found', async () => {
    db.getUser.mockResolvedValue(null);

    const req = { params: { id: 1 } };
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});