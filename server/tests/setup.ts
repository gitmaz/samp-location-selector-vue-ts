import { randomBytes } from 'crypto';
import os from 'os';
import path from 'path';

/**
 * Must run before any module imports `database.ts`, so the test suite uses an isolated DB file.
 */
const testDbPath = path.join(os.tmpdir(), `locations-test-${randomBytes(8).toString('hex')}.db`);
process.env.TEST_SQLITE_PATH = testDbPath;
