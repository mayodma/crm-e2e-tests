# CRM E2E Test Suite — Intern Guide

Welcome to the CRM automated test project. This guide explains everything from scratch — what the project does, why each technology is used, and what every line of code means.

---

## Table of Contents

1. [What is E2E Testing?](#1-what-is-e2e-testing)
2. [Why Playwright?](#2-why-playwright)
3. [Why TypeScript?](#3-why-typescript)
4. [Project Structure](#4-project-structure)
5. [How to Set Up the Project](#5-how-to-set-up-the-project)
6. [Environment Variables — .env.test](#6-environment-variables----envtest)
7. [package.json — Scripts & Dependencies](#7-packagejson----scripts--dependencies)
8. [tsconfig.json — TypeScript Configuration](#8-tsconfigjson----typescript-configuration)
9. [playwright.config.ts — Test Configuration](#9-playwrightconfigts----test-configuration)
10. [auth.setup.ts — Login Once Before All Tests](#10-authsetupts----login-once-before-all-tests)
11. [Page Objects — What & Why](#11-page-objects----what--why)
12. [TicketsPage.ts — Page Object Explained](#12-ticketspagests----page-object-explained)
13. [login.spec.ts — Login UI Tests](#13-loginspects----login-ui-tests)
14. [tickets.spec.ts — Tickets UI Tests](#14-ticketsspects----tickets-ui-tests)
15. [tickets.api.spec.ts — API Tests](#15-ticketsapispects----api-tests)
16. [How to Run Tests](#16-how-to-run-tests)
17. [Understanding Test Results](#17-understanding-test-results)
18. [Common Errors & How to Fix Them](#18-common-errors--how-to-fix-them)

---

## 1. What is E2E Testing?

**E2E (End-to-End) testing** means testing the entire application the way a real user would — opening a browser, clicking buttons, filling forms, and checking that the right things appear on screen.

Think of it this way:
- **Unit test** — tests one small function in isolation
- **Integration test** — tests how a few parts work together
- **E2E test** — tests the whole system from the user's perspective

In this project we test the **CRM (Customer Relationship Management)** web application. We test things like:
- Can a user log in?
- Does the tickets list load?
- Can a user search for a ticket?
- Does the API return the correct data?

---

## 2. Why Playwright?

**Playwright** is a tool made by Microsoft that controls a real browser (Chrome, Firefox, Safari) automatically. It is used by companies worldwide for E2E testing.

Why we chose Playwright over alternatives:
- Works with Chrome, Firefox, and Safari
- Has excellent TypeScript support
- Can test both UI (browser) and API in the same project
- Has built-in screenshot, video, and trace recording on failures
- Handles login sessions efficiently (save once, reuse everywhere)
- Much faster and more reliable than older tools like Selenium

---

## 3. Why TypeScript?

**TypeScript** is JavaScript with types added. For example:

```typescript
// JavaScript — no error checking
function greet(name) {
    return "Hello " + name;
}

// TypeScript — will show error if you pass a number instead of a string
function greet(name: string): string {
    return "Hello " + name;
}
```

We use TypeScript because:
- It catches mistakes before the tests even run
- It gives autocomplete suggestions in your code editor
- It makes the code easier to read and understand
- Playwright has full TypeScript support built in

---

## 4. Project Structure

```
crm-e2e-tests/
│
├── .env.test                          # Secret credentials (not committed to git)
├── package.json                       # Project dependencies and run scripts
├── tsconfig.json                      # TypeScript settings
├── playwright.config.ts               # Playwright settings
│
└── src/
    ├── fixtures/
    │   ├── auth.setup.ts              # Logs in once and saves the session
    │   └── .auth/
    │       └── agent.json             # Saved login session (auto-generated)
    │
    ├── pages/
    │   └── TicketsPage.ts             # Page Object for the Tickets page
    │
    └── tests/
        ├── api/
        │   └── tickets.api.spec.ts    # API tests (no browser)
        └── ui/
            ├── auth/
            │   └── login.spec.ts      # Login page tests
            └── tickets/
                └── tickets.spec.ts    # Tickets page tests
```

**Key concept:** Tests are separated into `api/` (testing the backend directly) and `ui/` (testing the browser interface).

---

## 5. How to Set Up the Project

### Step 1 — Install Node.js
Download and install Node.js from nodejs.org. This is the runtime that executes JavaScript/TypeScript.

### Step 2 — Clone the project
```bash
git clone <repository-url>
cd crm-e2e-tests
```

### Step 3 — Install dependencies
```bash
npm install
```
This reads `package.json` and downloads all the required tools into a `node_modules/` folder.

### Step 4 — Install Playwright browsers
```bash
npx playwright install
```
This downloads the actual browser binaries that Playwright controls.

### Step 5 — Set up the environment file
The `.env.test` file already exists with the correct values. Never commit this file to git as it contains passwords.

### Step 6 — Run the tests
```bash
npm test
```

---

## 6. Environment Variables — .env.test

This file stores all sensitive and environment-specific values. The tests read from this file instead of having passwords hardcoded in the code.

```env
# The URL of the CRM web application being tested
APP_URL=https://brave-glacier-0aaf84f00.4.azurestaticapps.net

# Keycloak is the authentication server the CRM uses for login
KEYCLOAK_URL=https://74-225-206-192.sslip.io
KEYCLOAK_REALM=crmai-dev
KEYCLOAK_CLIENT_ID=crmai-frontend

# Test user accounts — these are dedicated accounts created just for testing
TEST_AGENT_EMAIL=vapeto4208@fengnu.com
TEST_AGENT_PASSWORD=1qaz2wsx

TEST_SUPERVISOR_EMAIL=vihejo4906@elafans.com
TEST_SUPERVISOR_PASSWORD=1qaz2wsx

TEST_ADMIN_EMAIL=boxok34809@lawicon.com
TEST_ADMIN_PASSWORD=1qaz2wsx

# The base URLs of the backend APIs being tested
AUTH_API_URL=https://104.211.66.104.sslip.io/auth
TICKET_API_URL=https://104.211.66.104.sslip.io/tickets
MASTER_DATA_API_URL=https://104.211.66.104.sslip.io/master-data
```

**Why separate test accounts?** We never use real user accounts in tests because:
- Tests may create, modify, or delete data
- Tests run at any time, including during business hours
- A dedicated test account keeps test activity isolated from real users

**Why not hardcode the URL in the test files?** If the URL changes, you only need to update `.env.test` in one place instead of updating every test file.

---

## 7. package.json — Scripts & Dependencies

```json
"scripts": {
    "test"         : "playwright test",
    "test:api"     : "playwright test --project=api",
    "test:ui"      : "playwright test --project=ui",
    "test:setup"   : "playwright test --project=setup",
    "test:headed"  : "playwright test --headed",
    "test:debug"   : "playwright test --debug",
    "report"       : "playwright show-report"
}
```

| Script | Command | What it does |
|---|---|---|
| `npm test` | `playwright test` | Runs all tests |
| `npm run test:api` | `--project=api` | Runs only API tests |
| `npm run test:ui` | `--project=ui` | Runs only UI browser tests |
| `npm run test:headed` | `--headed` | Opens a visible browser window |
| `npm run test:debug` | `--debug` | Opens Playwright Inspector for step-by-step debugging |
| `npm run report` | `show-report` | Opens the HTML test report in your browser |

**Dependencies explained:**

| Package | Purpose |
|---|---|
| `@playwright/test` | The core testing framework — controls browsers and makes assertions |
| `dotenv` | Reads the `.env.test` file and makes variables available via `process.env` |
| `typescript` | The TypeScript compiler |
| `ts-node` | Allows running TypeScript files directly without compiling first |

---

## 8. tsconfig.json — TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",        // Output JavaScript compatible with modern environments
    "module": "commonjs",      // Use Node.js module format
    "lib": ["ES2022"],         // Include ES2022 standard library features
    "strict": true,            // Enable all strict type checks — catches more errors
    "esModuleInterop": true,   // Allows importing CommonJS modules cleanly
    "resolveJsonModule": true, // Allows importing .json files
    "outDir": "./dist",        // Compiled output goes here (not used directly)
    "baseUrl": ".",            // Root of the project for path resolution
    "paths": {
      "@/*": ["src/*"]         // @/pages/TicketsPage → src/pages/TicketsPage
    }
  },
  "include": ["src/**/*", "playwright.config.ts"]  // Files to compile
}
```

**The `@/` path alias explained:**

Without the alias, imports look like this:
```typescript
import { TicketsPage } from '../../../pages/TicketsPage';  // hard to read
```

With the alias, imports look like this:
```typescript
import { TicketsPage } from '@/pages/TicketsPage';  // clean and consistent
```

The `@/` always means the `src/` folder regardless of where the file is located.

---

## 9. playwright.config.ts — Test Configuration

This is the main configuration file. Every Playwright project has one.

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
```
- `defineConfig` — a helper that provides type-checking and autocomplete for the config
- `devices` — presets for different browsers and screen sizes (e.g. Desktop Chrome, iPhone 12)
- `dotenv` — loads the `.env.test` file so `process.env.APP_URL` etc. are available

```typescript
dotenv.config({ path: '.env.test' });
```
Reads the `.env.test` file immediately when the config loads, before any test runs.

```typescript
testDir: './src/tests',
```
The default folder where Playwright looks for test files.

```typescript
timeout: 30_000,
```
Each individual test has 30 seconds to complete. If it takes longer, it fails automatically. The `_` in `30_000` is just a visual separator (same as writing `30000`).

```typescript
retries: process.env.CI ? 2 : 0,
```
In a CI (Continuous Integration) environment like GitHub Actions, failed tests retry up to 2 times. Locally, no retries — you want to see the failure immediately.

```typescript
workers: process.env.CI ? 2 : 1,
```
How many tests run at the same time. `1` means tests run one after another (sequential). This is safer for UI tests as they share a browser session.

```typescript
reporter: [
    ['list'],                       // prints test names to terminal as they run
    ['html', { open: 'never' }],    // saves an HTML report (open manually with npm run report)
],
```

```typescript
use: {
    baseURL: process.env.APP_URL ?? 'http://localhost:3000',
```
All `page.goto('/')` calls will go to this URL. The `??` means "use APP_URL, but if it's not set, fall back to localhost:3000".

```typescript
    trace: 'on-first-retry',
```
When a test fails and retries, Playwright records a "trace" — a recording of every action, network request, and DOM state. You can open it with `npx playwright show-trace`.

```typescript
    screenshot: 'only-on-failure',
```
Automatically takes a screenshot when a test fails. Saved in `test-results/`.

```typescript
    video: 'on-first-retry',
```
Records a video of the browser on the first retry of a failed test.

```typescript
    launchOptions: { slowMo: 800 },
```
Adds an 800ms pause between every action. Useful for watching tests run. **Remove this for production test runs** as it makes tests much slower.

### Projects — Three Separate Test Suites

```typescript
projects: [
    {
        name: 'setup',
        testDir: './src/fixtures',
        testMatch: /auth\.setup\.ts/,
    },
```
The **setup** project runs `auth.setup.ts` first, before anything else. It logs in and saves the session.

```typescript
    {
        name: 'api',
        testDir: './src/tests/api',
        use: { ...devices['Desktop Chrome'] },
    },
```
The **api** project runs API tests. These don't open a browser — they make HTTP requests directly. `Desktop Chrome` is included only to set realistic request headers.

```typescript
    {
        name: 'ui',
        testDir: './src/tests/ui',
        use: {
            ...devices['Desktop Chrome'],
            storageState: 'src/fixtures/.auth/agent.json',
        },
        dependencies: ['setup'],
    },
```
The **ui** project runs browser tests. It depends on `setup` — meaning `setup` must complete successfully first. It loads the saved login session from `agent.json` so every test starts already logged in.

---

## 10. auth.setup.ts — Login Once Before All Tests

This file runs once before all UI tests. Its job is to log in to the application and save the browser session to a file.

```typescript
import { test as setup, expect } from '@playwright/test';
```
Imports Playwright's test function but renames it `setup`. This is cosmetic — it makes the code read as "this is a setup step, not a regular test".

```typescript
import * as path from 'path';
import * as fs from 'fs';
```
Node.js built-in modules. `path` helps build file paths correctly across Windows/Mac/Linux. `fs` (file system) reads and creates files and folders.

```typescript
const AUTH_DIR = path.join(__dirname, '.auth');
const AGENT_AUTH_FILE = path.join(AUTH_DIR, 'agent.json');
```
- `__dirname` = the folder where this file lives (`src/fixtures/`)
- `AUTH_DIR` = `src/fixtures/.auth/`
- `AGENT_AUTH_FILE` = `src/fixtures/.auth/agent.json`

```typescript
if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
}
```
Creates the `.auth/` folder if it doesn't exist yet. `recursive: true` means it creates any missing parent folders too.

```typescript
setup('log in as agent', async ({ page }) => {
    await page.goto('/');
```
Navigates to the app homepage. The CRM immediately redirects unauthenticated users to Keycloak.

```typescript
    await page.waitForURL(/\/realms\//);
```
Waits until the browser URL contains `/realms/` — this confirms the Keycloak login page has loaded. The `/` at the start and end make this a JavaScript regular expression (regex).

```typescript
    await page.getByLabel('Email').fill(process.env.TEST_AGENT_EMAIL!);
    await page.locator('#password').fill(process.env.TEST_AGENT_PASSWORD!);
```
- `getByLabel('Email')` — finds the input field whose label says "Email"
- `locator('#password')` — finds the element with `id="password"` (used because the Password label matched two elements)
- `.fill()` — types text into the input field
- The `!` at the end tells TypeScript "I'm sure this value exists"

```typescript
    await page.getByRole('button', { name: 'Login' }).click();
```
Finds the button with the text "Login" and clicks it.

```typescript
    await page.waitForURL(process.env.APP_URL + '/**');
```
Waits for the browser to redirect back to the CRM after login. The `/**` matches any path under that URL.

```typescript
    await expect(page).toHaveURL(new RegExp(process.env.APP_URL!));
```
Asserts (verifies) that the current URL matches the expected app URL. If this fails, the test fails here with a clear message.

```typescript
    await page.context().storageState({ path: AGENT_AUTH_FILE });
});
```
Saves the entire browser session — cookies, localStorage, sessionStorage — to `agent.json`. All UI tests then load this file to start already logged in, without going through the login flow each time.

---

## 11. Page Objects — What & Why

A **Page Object** is a TypeScript class that represents one page (or section) of the application. Instead of writing locators and actions directly in every test, you put them in a Page Object class.

**Without Page Objects (bad):**
```typescript
// test 1
await page.locator('div.scrollbar-custom.flex-1.min-h-0').waitFor({ state: 'visible' });
await page.locator('div.scrollbar-custom.flex-1.min-h-0').locator('button[type="button"]').first().click();

// test 2 — same locators repeated
await page.locator('div.scrollbar-custom.flex-1.min-h-0').waitFor({ state: 'visible' });
await page.locator('div.scrollbar-custom.flex-1.min-h-0').locator('button[type="button"]').first().click();
```

**With Page Objects (good):**
```typescript
// test 1
const ticketsPage = new TicketsPage(page);
await ticketsPage.waitForTicketsToLoad();
await ticketsPage.openFirstTicket();

// test 2 — same clean code
const ticketsPage = new TicketsPage(page);
await ticketsPage.waitForTicketsToLoad();
await ticketsPage.openFirstTicket();
```

**Benefits:**
- If the UI changes (e.g. a CSS class changes), you update the locator in ONE place — the Page Object — not in every test
- Tests become readable like plain English
- Actions are reusable across multiple test files

---

## 12. TicketsPage.ts — Page Object Explained

```typescript
import { type Page, type Locator, expect } from '@playwright/test';
```
- `Page` — represents the browser tab
- `Locator` — represents a reference to a UI element (doesn't find it yet, just describes it)
- `expect` — used to make assertions (verify something is true)
- `type` keyword means these are imported only as TypeScript types, not runtime values

```typescript
export class TicketsPage {
    readonly page: Page;
```
`readonly` means these properties can only be set in the constructor, not changed later. This prevents accidental modifications.

### Locator Properties

```typescript
readonly ticketList: Locator;
```
The scrollable container that holds all ticket rows.

```typescript
readonly firstTicket: Locator;
```
The first ticket button in the list.

```typescript
readonly filterIconButton: Locator;
```
The funnel icon button that opens the filter panel.

```typescript
readonly filterStatusDropdown: Locator;
```
The Status dropdown inside the filter panel.

```typescript
readonly filterApplyButton: Locator;
```
The "Filter" button that applies the selected filters.

```typescript
readonly ticketSearchInput: Locator;
```
The search text input field.

```typescript
readonly searchButton: Locator;
```
The magnifying glass icon button next to the search input.

### Constructor

```typescript
constructor(page: Page) {
    this.page = page;
```
The constructor receives the Playwright `page` object and stores it. Every locator is built from this page.

```typescript
    this.ticketList = page.locator('div.scrollbar-custom.flex-1.min-h-0');
```
Finds a `<div>` element that has ALL THREE CSS classes: `scrollbar-custom`, `flex-1`, and `min-h-0`. The `.` means "and also has this class". We need all three to distinguish this container from another `scrollbar-custom` div in the ticket details panel.

```typescript
    this.firstTicket = this.ticketList.locator('button[type="button"]').first();
```
Finds the first `<button type="button">` inside the ticket list. Scoping to `this.ticketList` ensures we don't accidentally pick up buttons from other parts of the page.

```typescript
    this.filterIconButton = page.locator('button.w-13');
```
The filter funnel icon button. It has no `aria-label` or `id`, but it uses the unique CSS class `w-13` (a non-standard Tailwind class that appears only on this button).

```typescript
    this.filterStatusDropdown = page.locator('select').first();
```
The first `<select>` dropdown on the page, which is the Status dropdown inside the filter panel.

```typescript
    this.filterApplyButton = page.locator('button.flex-1', { hasText: 'Filter' });
```
Finds a button with class `flex-1` whose visible text contains "Filter". The `hasText` option filters the results.

```typescript
    this.ticketSearchInput = page.getByPlaceholder('Search Ticket');
```
Finds the input field by its placeholder text. `getByPlaceholder` is more readable and semantic than a CSS selector.

```typescript
    this.searchButton = page.locator('button[aria-label="Search"]');
```
Finds the button with `aria-label="Search"` — this is the magnifying glass icon next to the search input.

### Methods

```typescript
async goto() {
    await this.page.goto('/tickets');
}
```
Navigates to `/tickets`. The full URL is `APP_URL + /tickets` because `baseURL` is set in the config.

```typescript
async waitForTicketsToLoad() {
    await this.ticketList.waitFor({ state: 'visible' });
    await this.firstTicket.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}
```
- First waits for the ticket list container to appear
- Then waits up to 10 seconds for the first ticket to appear (data loading from the API)
- `.catch(() => {})` means if no tickets load in 10 seconds, don't throw an error — let the test handle the empty state itself

```typescript
async searchFor(query: string) {
    await this.ticketSearchInput.fill(query);
    await this.searchButton.click();
}
```
Types the search query and clicks the search icon to trigger the search.

```typescript
async openFirstTicket() {
    await this.firstTicket.click();
    await this.page.waitForURL(/\/tickets\/.+/);
}
```
Clicks the first ticket and waits for the URL to change to `/tickets/<some-id>`. The `.+` in the regex means "one or more of any character".

```typescript
async getTicketCount(): Promise<number> {
    return await this.ticketList.locator('button[type="button"]').count();
}
```
Returns how many ticket row buttons are currently visible. `Promise<number>` means this async function returns a number.

```typescript
async filterByStatus(status: 'UNASSIGNED' | 'ASSIGNED' | 'REJECTED' | 'RESOLVED' | 'CLOSED' | 'UNREAD') {
    await this.filterIconButton.click();
    await this.filterStatusDropdown.selectOption({ value: status });
    await this.filterApplyButton.click();
    await this.page.waitForTimeout(1000);
}
```
- The parameter type `'UNASSIGNED' | 'ASSIGNED' | ...` is a union type — TypeScript will give an error if you try to pass any other value
- `selectOption({ value: status })` selects the dropdown option whose `value` attribute matches (e.g. `value="RESOLVED"`)
- `waitForTimeout(1000)` waits 1 second for the filtered results to load

---

## 13. login.spec.ts — Login UI Tests

```typescript
test.use({ storageState: { cookies: [], origins: [] } });
```
This overrides the project-level `storageState` setting. Normally all UI tests load the saved login session. But these tests are specifically testing the login page, so they must start with NO session — as if a brand new user visited the site.

### Test 1: Unauthenticated Redirect

```typescript
test('unauthenticated user is redirected to Keycloak', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveURL(/\/realms\//);
});
```
Verifies that visiting a protected page without being logged in redirects to Keycloak. This test confirms the app's authentication guard is working.

### Test 2: Successful Login

```typescript
test('agent can log in successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/realms\//);
    await page.getByLabel('Email').fill(process.env.TEST_AGENT_EMAIL!);
    await page.locator('#password').fill(process.env.TEST_AGENT_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(new RegExp(process.env.APP_URL!));
    await expect(page.locator('aside')).toBeVisible();
});
```
Tests the full login flow step by step:
1. Go to the app (redirects to Keycloak)
2. Wait for Keycloak URL to confirm we're on the login page
3. Fill Email and Password
4. Click Login
5. Wait for redirect back to the app
6. Assert the sidebar (`<aside>`) is visible — confirms we are inside the authenticated app

---

## 14. tickets.spec.ts — Tickets UI Tests

All tests in this file automatically start logged in as the test agent (because the `ui` project loads `agent.json`).

### Test 1: Page Loads

```typescript
test('tickets page loads and shows list', async ({ page }) => {
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.goto();
    await ticketsPage.waitForTicketsToLoad();
    await expect(ticketsPage.ticketList).toBeVisible();
});
```
The most basic test — simply verify the ticket list appears after navigating to `/tickets`.

### Test 2: Open a Ticket

```typescript
test('can open a ticket and see details', async ({ page }) => {
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.goto();
    await ticketsPage.waitForTicketsToLoad();

    const count = await ticketsPage.getTicketCount();

    if (count > 0) {
        await ticketsPage.openFirstTicket();
        await expect(page).toHaveURL(/\/tickets\/.+/);
    } else {
        test.skip(true, 'No tickets in test environment');
    }
});
```
Clicks the first ticket and verifies the URL changes to a ticket detail URL. The `if/else` handles the case where the test agent has no tickets — it skips gracefully instead of failing.

### Test 3: Search

```typescript
test('search filters tickets', async ({ page }) => {
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.goto();
    await ticketsPage.waitForTicketsToLoad();

    await ticketsPage.searchFor('Student');
    await page.waitForTimeout(1500);

    const countAfter = await ticketsPage.getTicketCount();
    expect(countAfter).toBeGreaterThan(0);
});
```
Types "Student" in the search box and clicks search, then verifies at least one result appears. `waitForTimeout(1500)` gives the API 1.5 seconds to respond with results.

### Test 4: Filter by Status

```typescript
test('can filter tickets by status', async ({ page }) => {
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.goto();
    await ticketsPage.waitForTicketsToLoad();

    await ticketsPage.filterByStatus('RESOLVED');

    await expect(ticketsPage.ticketList).toBeVisible();
});
```
Opens the filter panel, selects "Resolved", applies the filter, and verifies the ticket list is still visible.

---

## 15. tickets.api.spec.ts — API Tests

API tests don't open a browser. They make HTTP requests directly to the backend, just like Postman would. This is faster and tests the backend in isolation.

### Getting an Auth Token

```typescript
async function getToken(): Promise<string> {
    const response = await fetch(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'password',
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                username: process.env.TEST_AGENT_EMAIL!,
                password: process.env.TEST_AGENT_PASSWORD!,
            }),
        }
    );
    const data = await response.json() as { access_token?: string };
    if (!data.access_token) {
        throw new Error(`Failed to get token: ${JSON.stringify(data)}`);
    }
    return data.access_token;
}
```
This function calls the Keycloak token endpoint directly using the `password` grant type (Direct Access Grant). It passes the client ID, username, and password, and receives a JWT access token in return.

The `as { access_token?: string }` tells TypeScript the shape of the JSON response. The `?` means the field might not be present — hence the check below it.

```typescript
test.beforeAll(async () => {
    token = await getToken();
});
```
`beforeAll` runs once before any test in this file. The token is stored in the `token` variable and reused by all three tests — we don't request a new token for each test.

### Test 1: List Returns 200

```typescript
test('GET /api/tickets returns a list', async ({ request }) => {
    const response = await request.get(`${process.env.TICKET_API_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);
});
```
- `{ request }` — Playwright's built-in HTTP client (no browser needed)
- `Authorization: Bearer ${token}` — sends the JWT token in the request header (standard for secured APIs)
- Asserts status is 200 (success)
- Asserts the response has an `items` property that is an array

### Test 2: Ticket Shape is Correct

```typescript
if (body.items.length > 0) {
    const ticket = body.items[0];
    expect(ticket).toHaveProperty('ticketId');
    expect(ticket).toHaveProperty('status');
    expect(ticket).toHaveProperty('ticketNumber');
}
```
Takes the first ticket from the list and verifies it has the expected fields. This catches API breaking changes — if a developer renames `ticketId` to `id`, this test will fail and alert the team.

### Test 3: 404 for Non-Existent Ticket

```typescript
test('GET /api/tickets/{id} returns 404 for non-existent ticket', async ({ request }) => {
    const response = await request.get(
        `${process.env.TICKET_API_URL}/api/tickets/00000000-0000-0000-0000-000000000000`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(response.status()).toBe(404);
});
```
Uses an all-zeros UUID (guaranteed to not exist) and verifies the API returns a `404 Not Found` status. This confirms the API handles missing resources correctly.

---

## 16. How to Run Tests

| What you want to do | Command |
|---|---|
| Run all tests | `npm test` |
| Run only API tests | `npm run test:api` |
| Run only UI tests | `npm run test:ui` |
| Run a specific file | `npx playwright test src/tests/ui/tickets/tickets.spec.ts` |
| Watch tests run in browser | `npx playwright test --headed` |
| Debug step by step | `npm run test:debug` |
| Open HTML report | `npm run report` |

---

## 17. Understanding Test Results

```
✓  1 [setup] › src\fixtures\auth.setup.ts:14:6 › log in as agent (10.6s)
✓  2 [api]   › GET /api/tickets returns a list (526ms)
✘  3 [ui]    › Tickets Page › search filters tickets (30.1s)
-  4 [ui]    › Tickets Page › can open a ticket and see details
```

| Symbol | Meaning |
|---|---|
| `✓` | Test passed |
| `✘` | Test failed |
| `-` | Test was skipped |

The number in brackets is the time the test took. API tests are fast (milliseconds). UI tests are slower (seconds) because they control a real browser.

When a test fails, Playwright automatically saves:
- A **screenshot** of what the browser looked like at the moment of failure
- A **video** (on first retry)
- A **trace** file for deep debugging

All saved to the `test-results/` folder.

---

## 18. Common Errors & How to Fix Them

### "ENOENT: no such file or directory, open agent.json"
The login setup hasn't run yet or failed. Run setup first:
```bash
npm run test:setup
```

### "locator resolved to 2 elements"
Your locator matches more than one element. Make it more specific by adding extra CSS classes or using a parent container scope.

### "Test timeout of 30000ms exceeded"
The test took longer than 30 seconds. Common causes:
- The app is slow to load
- `waitForLoadState('networkidle')` never resolves (WebSocket connections keep the page "active") — replace with `waitForTimeout(1500)`
- A locator is wrong and Playwright kept waiting for an element that doesn't exist

### "unauthorized_client"
The `KEYCLOAK_CLIENT_ID` in `.env.test` is wrong, or Direct Access Grants is not enabled for that client in the Keycloak admin console.

### "getByLabel resolved to 0 elements"
The label text doesn't match exactly. Inspect the page in your browser (right-click → Inspect) and find the exact `<label>` text.

### "Failed to get token"
The test user credentials in `.env.test` are wrong or the account doesn't exist in Keycloak.

---

*This document was written for the CRM E2E test project. If you find anything outdated, update this file alongside the code change.*
