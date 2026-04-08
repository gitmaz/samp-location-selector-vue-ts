import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Resolve DB path relative to the server package root (where npm start runs).
 * This stays correct for both `tsx src/app.ts` and `node dist/server/src/app.js`.
 * Integration tests set `TEST_SQLITE_PATH` (see `tests/setup.ts`) to an isolated file.
 */
const serverRoot = process.cwd();
const dbPath =
  process.env.TEST_SQLITE_PATH ?? path.join(serverRoot, 'data', 'locations.db');

if (process.env.TEST_SQLITE_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export function closeDb(): void {
  db.close();
}

export default db;
