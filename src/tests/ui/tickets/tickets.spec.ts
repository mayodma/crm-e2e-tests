import { test, expect } from '@playwright/test';
import { TicketsPage } from '@/pages/TicketsPage';

// This project inherits the agent storageState from playwright.config.ts
// So we're already logged in at the start of each test

test.describe('Tickets Page', () => {
    test('tickets page loads and shows list', async ({ page }) => {
        const ticketsPage = new TicketsPage(page);

        await ticketsPage.goto();
        await ticketsPage.waitForTicketsToLoad();

        // Ticket list should be visible
        await expect(ticketsPage.ticketList).toBeVisible();
    });

    test('can open a ticket and see details', async ({ page }) => {
        const ticketsPage = new TicketsPage(page);

        await ticketsPage.goto();
        await ticketsPage.waitForTicketsToLoad();

        const count = await ticketsPage.getTicketCount();

        if (count > 0) {
            await ticketsPage.openFirstTicket();
            // URL should now be /tickets/some-uuid
            await expect(page).toHaveURL(/\/tickets\/.+/);
        } else {
            test.skip(true, 'No tickets in test environment');
        }
    });

    test('search filters tickets', async ({ page }) => {
        const ticketsPage = new TicketsPage(page);

        await ticketsPage.goto();
        await ticketsPage.waitForTicketsToLoad();

        await ticketsPage.searchFor('Student');

        // Wait for search results to update
        await page.waitForTimeout(1500);

        // Searching for 'Student' should return at least one result
        const countAfter = await ticketsPage.getTicketCount();
        expect(countAfter).toBeGreaterThan(0);
    });

    test('can filter tickets by status', async ({ page }) => {
        const ticketsPage = new TicketsPage(page);

        await ticketsPage.goto();
        await ticketsPage.waitForTicketsToLoad();

        await ticketsPage.filterByStatus('RESOLVED');

        // After filtering, ticket list should still be visible
        await expect(ticketsPage.ticketList).toBeVisible();
    });
});
