import { type Page, type Locator, expect } from '@playwright/test';

export class TicketsPage {
    readonly page: Page;

    // Define all locators in one place
    readonly ticketList: Locator;
    readonly firstTicket: Locator;
    readonly filterIconButton: Locator;     // funnel icon that opens the filter panel
    readonly filterStatusDropdown: Locator;       // status dropdown inside the filter panel
    readonly filterApplyButton: Locator;    // Filter button that applies the selected filters
    readonly ticketSearchInput: Locator;
    readonly searchButton: Locator;             // search icon button next to search input

    constructor(page: Page) {
        this.page = page;
        this.ticketList = page.locator('div.scrollbar-custom.flex-1.min-h-0');               // scrollable ticket list container (not the details panel)
        this.firstTicket = this.ticketList.locator('button[type="button"]').first();         // first ticket row inside the list
        this.filterIconButton = page.locator('button.w-13');                                // funnel icon button (unique w-13 class)
        this.filterStatusDropdown = page.locator('select').first();                                // status dropdown inside filter panel
        this.filterApplyButton = page.locator('button.flex-1', { hasText: 'Filter' });      // Filter apply button
        this.ticketSearchInput = page.getByPlaceholder('Search Ticket');                     // exact placeholder from HTML
        this.searchButton = page.locator('button[aria-label="Search"]');                     // search icon button next to search input
    }

    async goto() {
        await this.page.goto('/tickets');
    }

    async waitForTicketsToLoad() {
        await this.ticketList.waitFor({ state: 'visible' });
        // Wait for tickets to render inside the list (loading spinner to finish)
        await this.firstTicket.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }

    async searchFor(query: string) {
        await this.ticketSearchInput.fill(query);
        await this.searchButton.click();         // click search icon to trigger search
    }

    async openFirstTicket() {
        await this.firstTicket.click();
        await this.page.waitForURL(/\/tickets\/.+/);
    }

    async getTicketCount(): Promise<number> {
        return await this.ticketList.locator('button[type="button"]').count();
    }

    async filterByStatus(status: 'UNASSIGNED' | 'ASSIGNED' | 'REJECTED' | 'RESOLVED' | 'CLOSED' | 'UNREAD') {
        // Open filter panel
        await this.filterIconButton.click();
        // Select status by value
        await this.filterStatusDropdown.selectOption({ value: status });
        // Apply filter
        await this.filterApplyButton.click();
        await this.page.waitForTimeout(1000);
    }
}
