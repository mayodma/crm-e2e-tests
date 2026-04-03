import { test, expect } from '@playwright/test';

// NOTE: This test does NOT use the saved auth state
// It tests the login page itself
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
    test('unauthenticated user is redirected to Keycloak', async ({ page }) => {
        await page.goto('/tickets');

        // Should redirect to Keycloak
        await expect(page).toHaveURL(/\/realms\//);
    });

    test('agent can log in successfully', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/realms\//);

        await page.getByLabel('Email').fill(process.env.TEST_AGENT_EMAIL!);
        await page.locator('#password').fill(process.env.TEST_AGENT_PASSWORD!);
        await page.getByRole('button', { name: 'Login' }).click();

        await page.waitForURL(new RegExp(process.env.APP_URL!));

        // Sidebar should be visible after successful login
        await expect(page.locator('aside')).toBeVisible();
    });
});
