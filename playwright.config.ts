import { randomBytes } from 'crypto';
import os from 'os';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/** Isolated SQLite file for E2E (absolute path; server uses `process.cwd()` = `server/`). */
const e2eDbPath = path.join(os.tmpdir(), `locations-e2e-${randomBytes(8).toString('hex')}.db`);

/** Dedicated Vite port so `npm run dev` on 5174 can run while E2E runs. */
const e2eClientPort = process.env.E2E_CLIENT_PORT ?? '5175';
const baseURL = `http://localhost:${e2eClientPort}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev:e2e',
    cwd: process.cwd(),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      TEST_SQLITE_PATH: e2eDbPath,
      E2E_CLIENT_PORT: e2eClientPort,
      VITE_DEV_PORT: e2eClientPort,
    },
  },
});
