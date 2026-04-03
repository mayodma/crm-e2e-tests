import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Where to save the logged-in browser state
const AUTH_DIR = path.join(__dirname, '.auth');
const AGENT_AUTH_FILE = path.join(AUTH_DIR, 'agent.json');

// Create .auth directory if it doesn't exist
if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
}

setup('log in as agent', async ({ page }) => {
    // Go to the app — it will redirect to Keycloak login
    await page.goto('/');

    // Wait for Keycloak login page to appear
    // (the URL will change to keycloak's /auth/realms/... URL)
    await page.waitForURL(/\/realms\//);

    // Fill in the login form
    await page.getByLabel('Email').fill(process.env.TEST_AGENT_EMAIL!);
    await page.locator('#password').fill(process.env.TEST_AGENT_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait until we're back on the app (redirect back after login)
    await page.waitForURL(process.env.APP_URL + '/**');

    // Verify we landed on the dashboard
    await expect(page).toHaveURL(new RegExp(process.env.APP_URL!));

    // Save the browser session (cookies + localStorage) to a file
    await page.context().storageState({ path: AGENT_AUTH_FILE });
});
