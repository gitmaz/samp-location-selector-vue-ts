import Database from 'better-sqlite3';
import path from 'path';

/**
 * Resolve DB path relative to the server package root (where npm start runs).
 * This stays correct for both `tsx src/app.ts` and `node dist/server/src/app.js`.
 */
const serverRoot = process.cwd();
const dbPath = path.join(serverRoot, 'data', 'locations.db');

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

export default db;
