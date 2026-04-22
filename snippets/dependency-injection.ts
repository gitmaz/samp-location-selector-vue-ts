//tightly coupled

// userService.js
import db from './db';

export async function getUser(id) {
  return db.getUser(id);
}


//with dependency injection 
// userService.js
export function createUserService({ db }) {
  return {
    async getUser(id) {
      return db.getUser(id);
    }
  };
}

usage:

import db from './db';
import { createUserService } from './userService';

const userService = createUserService({ db });




app.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(user);
});

//testing is now easy:
import { createUserService } from './userService';

test('getUser returns data', async () => {
  const mockDb = {
    getUser: jest.fn().mockResolvedValue({ id: 1 })
  };

  const service = createUserService({ db: mockDb });

  const result = await service.getUser(1);

  expect(result).toEqual({ id: 1 });
});