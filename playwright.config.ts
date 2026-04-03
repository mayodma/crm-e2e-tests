import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
    testDir: './src/tests',
    timeout: 30_000,
    retries: process.env.CI ? 2 : 0,   // retry failed tests in CI only
    workers: process.env.CI ? 2 : 1,   // run sequentially locally

    reporter: [
        ['list'],                          // shows test names in terminal
        ['html', { open: 'never' }],       // generates HTML report
    ],

    use: {
        baseURL: process.env.APP_URL ?? 'http://localhost:3000',
        trace: 'on-first-retry',           // captures trace on failure
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        launchOptions: {
            slowMo: 800,
        },
    },

    projects: [
        // --- Setup: run login ONCE before UI tests ---
        {
            name: 'setup',
            testDir: './src/fixtures',
            testMatch: /auth\.setup\.ts/,
        },

        // --- API tests: no browser needed ---
        {
            name: 'api',
            testDir: './src/tests/api',
            use: { ...devices['Desktop Chrome'] },
        },

        // --- UI tests: depend on login setup ---
        {
            name: 'ui',
            testDir: './src/tests/ui',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'src/fixtures/.auth/agent.json',  // use saved session
            },
            dependencies: ['setup'],
        },
    ],
});