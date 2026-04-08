import type { LocationRow } from '../../../shared/location.js';
import db from '../config/database.js';

export interface NewLocationInput {
  address: string;
  latitude: number;
  longitude: number;
}

export function createLocation(input: NewLocationInput): LocationRow {
  const stmt = db.prepare(
    `INSERT INTO locations (address, latitude, longitude) VALUES (@address, @latitude, @longitude)`
  );
  const result = stmt.run(input);
  const id = Number(result.lastInsertRowid);
  const row = findById(id);
  if (!row) {
    throw new Error('Failed to read inserted location');
  }
  return row;
}

export function findById(id: number): LocationRow | undefined {
  return db
    .prepare(`SELECT * FROM locations WHERE id = ?`)
    .get(id) as LocationRow | undefined;
}

export function findAllOrderedByNewest(): LocationRow[] {
  return db
    .prepare(`SELECT * FROM locations ORDER BY datetime(created_at) DESC`)
    .all() as LocationRow[];
}

export function deleteById(id: number): boolean {
  const stmt = db.prepare(`DELETE FROM locations WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}
