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
19. [How to Push This Project to GitHub](#19-how-to-push-this-project-to-github)
20. [Fork, Get Latest Code, Create a Pull Request & Get it Merged](#20-fork-get-latest-code-create-a-pull-request--get-it-merged)

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
APP_URL=https://your-app-url.com

# Keycloak is the authentication server the CRM uses for login
KEYCLOAK_URL=https://your-keycloak-url.com
KEYCLOAK_REALM=your-realm-name
KEYCLOAK_CLIENT_ID=your-client-id

# Test user accounts — these are dedicated accounts created just for testing
TEST_AGENT_EMAIL=agent@example.com
TEST_AGENT_PASSWORD=your-agent-password

TEST_SUPERVISOR_EMAIL=supervisor@example.com
TEST_SUPERVISOR_PASSWORD=your-supervisor-password

TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=your-admin-password

# The base URLs of the backend APIs being tested
AUTH_API_URL=https://your-api-url.com/auth
TICKET_API_URL=https://your-api-url.com/tickets
MASTER_DATA_API_URL=https://your-api-url.com/master-data
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

---

## 19. How to Push This Project to GitHub

This section explains how to upload this project to GitHub so the whole team can access it. You only need to do the full setup once. After that, you just commit and push your changes.

---

### What is Git and GitHub?

- **Git** — a tool installed on your computer that tracks changes to your code over time. Think of it like a save history for your project.
- **GitHub** — a website that stores your git repository online so others can access it, collaborate, and review your work.

---

### Step 1 — Install Git

If you don't have Git installed:
1. Go to [git-scm.com](https://git-scm.com)
2. Download and install Git for Windows
3. Verify it works by running in terminal:
```bash
git --version
```
You should see something like `git version 2.44.0`.

---

### Step 2 — Configure Git with your name and email

This is a one-time setup. Git uses this to label your commits.

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email as your GitHub account.

---

### Step 3 — Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Click **New repository**
4. Fill in the form:
   - **Repository name:** `crm-e2e-tests`
   - **Description:** `Playwright E2E tests for the CRM application` (optional)
   - **Visibility:** Select **Private** (recommended — the project references test credentials)
   - **Important:** Do NOT tick "Add a README file", "Add .gitignore", or "Choose a license" — we already have these files
5. Click **Create repository**
6. GitHub will show a page with setup instructions — **copy the repository URL** at the top. It looks like:
   ```
   https://github.com/your-username/crm-e2e-tests.git
   ```

---

### Step 4 — Check the .gitignore file

Before committing, make sure the `.gitignore` file exists at the root of the project. This file tells Git which files to **never** upload to GitHub.

The `.gitignore` in this project already excludes:

```
.env.test                  ← contains passwords — NEVER commit this
src/fixtures/.auth/        ← contains live login tokens
test-results/              ← generated test output
playwright-report/         ← generated HTML reports
node_modules/              ← too large, reinstalled with npm install
dist/                      ← compiled TypeScript output
```

**Why is this important?** If `.env.test` is ever committed to a public repository, your passwords and server URLs are exposed to the entire internet.

---

### Step 5 — Initialise Git and make the first commit

Open a terminal in the project folder and run these commands **one at a time**:

**Initialise a git repository in this folder:**
```bash
git init
```
This creates a hidden `.git/` folder that tracks all changes.

**Stage all files for commit:**
```bash
git add .
```
The `.` means "add everything in this folder". Git will skip files listed in `.gitignore`.

**Check what will be committed (optional but recommended):**
```bash
git status
```
You should see your files listed in green. Make sure `.env.test` is NOT listed.

**Create the first commit:**
```bash
git commit -m "Initial commit: CRM E2E test suite with Playwright"
```
A commit is a saved snapshot. The `-m` flag sets the commit message — always write a short description of what changed.

**Rename the default branch to `main`:**
```bash
git branch -M main
```
GitHub uses `main` as the default branch name. This ensures consistency.

---

### Step 6 — Connect to GitHub and push

**Link your local repository to GitHub:**
```bash
git remote add origin https://github.com/YOUR-USERNAME/crm-e2e-tests.git
```
Replace `YOUR-USERNAME` with your actual GitHub username and use the URL you copied in Step 3.

**Upload your code to GitHub:**
```bash
git push -u origin main
```
- `push` — sends your commits to GitHub
- `-u origin main` — sets GitHub as the default destination for future pushes (only needed the first time)

GitHub may ask for your username and password. If you have two-factor authentication enabled, use a **Personal Access Token** instead of your password (GitHub Settings → Developer Settings → Personal Access Tokens).

---

### Step 7 — Verify on GitHub

1. Go to `https://github.com/YOUR-USERNAME/crm-e2e-tests`
2. You should see all your project files listed
3. Confirm that `.env.test` is **not** visible in the file list

---

### Day-to-day workflow — Making changes and pushing

After the initial setup, every time you make changes to the tests:

**1. Check what changed:**
```bash
git status
```

**2. Stage the changed files:**
```bash
git add .
```
Or stage a specific file only:
```bash
git add src/tests/ui/tickets/tickets.spec.ts
```

**3. Commit with a meaningful message:**
```bash
git commit -m "Add filter by status test to tickets spec"
```

**4. Push to GitHub:**
```bash
git push
```

---

### Useful Git commands for day-to-day use

| Command | What it does |
|---|---|
| `git status` | Shows which files have changed |
| `git add .` | Stages all changes |
| `git add <file>` | Stages one specific file |
| `git commit -m "message"` | Saves a snapshot with a description |
| `git push` | Uploads commits to GitHub |
| `git pull` | Downloads the latest changes from GitHub |
| `git log --oneline` | Shows a short history of all commits |
| `git diff` | Shows exactly what lines changed in your files |

---

### What NOT to commit — Quick checklist

Before every commit, check:

- [ ] `.env.test` is NOT staged (`git status` should not show it)
- [ ] `src/fixtures/.auth/agent.json` is NOT staged
- [ ] `node_modules/` is NOT staged
- [ ] `test-results/` is NOT staged

If any of these appear in `git status`, your `.gitignore` may be missing or incorrect.

---

---

## 20. Fork, Get Latest Code, Create a Pull Request & Get it Merged

This section explains the full team workflow — how an intern or new team member gets a copy of the project, makes changes safely, and submits those changes for review before they go into the main codebase.

---

### Key Concepts

| Term | Meaning |
|---|---|
| **Repository (repo)** | The project and its full history stored on GitHub |
| **Fork** | Your own personal copy of someone else's repository on GitHub |
| **Clone** | Downloading a repository from GitHub to your computer |
| **Branch** | An isolated copy of the code where you make changes without affecting the main code |
| **Commit** | A saved snapshot of your changes |
| **Pull Request (PR)** | A request to merge your changes into the main repository, with a review process |
| **Merge** | Combining your changes into the main branch after review |
| **Upstream** | The original repository that your fork was created from |

---

### The Full Workflow — Visual Overview

```
Original Repo (upstream)
        │
        │  Fork
        ▼
Your Fork on GitHub
        │
        │  Clone
        ▼
Your Computer (local)
        │
        │  Create branch → make changes → commit → push
        ▼
Your Fork on GitHub
        │
        │  Open Pull Request
        ▼
Original Repo ← Review → Approved → Merged
```

---

### Step 1 — Fork the Repository

A **fork** creates your own copy of the project under your GitHub account. You make all your changes in your fork, not directly in the original repository. This protects the main codebase.

1. Go to the original repository on GitHub (the team's repository)
2. Click the **Fork** button in the top right corner
3. Select your GitHub account as the destination
4. GitHub creates a copy at `https://github.com/YOUR-USERNAME/crm-e2e-tests`

You now have your own independent copy of the project.

---

### Step 2 — Clone Your Fork to Your Computer

Cloning downloads your fork from GitHub to your local machine.

```bash
git clone https://github.com/YOUR-USERNAME/crm-e2e-tests.git
```

This creates a folder called `crm-e2e-tests` on your computer. Navigate into it:

```bash
cd crm-e2e-tests
```

---

### Step 3 — Connect to the Original Repository (Upstream)

Your fork only knows about itself. You need to tell Git where the original repository is so you can pull in future updates from the team.

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/crm-e2e-tests.git
```

Replace `ORIGINAL-OWNER` with the GitHub username or organisation that owns the original repo.

**Verify your remotes are set up correctly:**
```bash
git remote -v
```

You should see:
```
origin    https://github.com/YOUR-USERNAME/crm-e2e-tests.git (fetch)
origin    https://github.com/YOUR-USERNAME/crm-e2e-tests.git (push)
upstream  https://github.com/ORIGINAL-OWNER/crm-e2e-tests.git (fetch)
upstream  https://github.com/ORIGINAL-OWNER/crm-e2e-tests.git (push)
```

- **origin** = your fork on GitHub
- **upstream** = the original team repository

---

### Step 4 — Get the Latest Code Before Starting Work

**Always do this before starting any new piece of work.** This ensures your code is up to date with whatever the team has merged recently.

**Fetch the latest changes from the original repo:**
```bash
git fetch upstream
```

**Switch to your main branch:**
```bash
git checkout main
```

**Merge the latest upstream changes into your local main:**
```bash
git merge upstream/main
```

**Push the updated main to your fork on GitHub:**
```bash
git push origin main
```

Your fork is now in sync with the original repository.

---

### Step 5 — Create a New Branch for Your Work

Never make changes directly on `main`. Always create a new branch for each piece of work (each bug fix, each new test, each feature).

**Why branches?**
- Your `main` stays clean and always matches the team's main
- Multiple people can work on different things simultaneously without conflicts
- If something goes wrong, you can delete the branch and start fresh

**Create and switch to a new branch:**
```bash
git checkout -b add-login-tests
```

The `-b` flag creates the branch and switches to it in one step. Use a short, descriptive name with hyphens. Examples:
- `add-login-tests`
- `fix-search-locator`
- `update-ticket-api-test`

**Verify you are on the new branch:**
```bash
git branch
```
The currently active branch will have a `*` next to it.

---

### Step 6 — Make Your Changes

Now make your changes — edit test files, add new tests, fix locators, etc.

As you work, save your progress with commits regularly. A good rule is to commit after each logical piece of work is complete.

**Check what you've changed:**
```bash
git status
```

**Stage your changes:**
```bash
git add .
```
Or stage specific files:
```bash
git add src/tests/ui/tickets/tickets.spec.ts
```

**Commit with a clear message:**
```bash
git commit -m "Add test for filtering tickets by resolved status"
```

**Good commit message rules:**
- Use present tense: "Add test" not "Added test"
- Be specific: describe what changed and why
- Keep it under 72 characters
- Examples:
  - ✓ `Fix Password locator to use #password ID`
  - ✓ `Add API test for 404 on missing ticket`
  - ✗ `fixed stuff`
  - ✗ `changes`

You can make multiple commits as you work. Each commit is a checkpoint in your history.

---

### Step 7 — Run the Tests Before Pushing

Always run the tests locally before pushing to make sure you haven't broken anything.

```bash
npm test
```

All tests should pass (or skip) with no failures. If something fails, fix it before pushing.

---

### Step 8 — Push Your Branch to Your Fork on GitHub

```bash
git push origin add-login-tests
```

Replace `add-login-tests` with your actual branch name. This uploads your branch to your GitHub fork.

---

### Step 9 — Open a Pull Request

A **Pull Request (PR)** is how you ask the team to review and accept your changes into the main repository.

1. Go to your fork on GitHub: `https://github.com/YOUR-USERNAME/crm-e2e-tests`
2. GitHub will show a yellow banner saying **"Your branch had recent pushes"** with a **"Compare & pull request"** button — click it
3. If you don't see the banner, go to the **Pull requests** tab and click **New pull request**
4. Set the branches correctly:
   - **Base repository:** the original team repo
   - **Base branch:** `main`
   - **Head repository:** your fork
   - **Compare branch:** your branch (e.g. `add-login-tests`)
5. Fill in the Pull Request form:

**Title:** Short and clear — what does this PR do?
```
Add filter by resolved status test to tickets spec
```

**Description:** Explain what you changed and why. Include:
- What the change does
- Why it was needed
- How to test it manually if needed
- Any known limitations

Example:
```
## What changed
- Added `filterByStatus('RESOLVED')` test to tickets.spec.ts
- Updated `filterByStatus` method in TicketsPage.ts to use the
  filter panel (funnel icon → status dropdown → Filter button)

## Why
The previous test was using pill buttons that don't exist for
the agent role. This approach uses the correct filter panel.

## How to test
Run: npx playwright test src/tests/ui/tickets/tickets.spec.ts --headed
All 4 tests should pass.
```

6. Click **Create Pull Request**

---

### Step 10 — The Review Process

After opening a PR, a team member (or your supervisor) will review your changes.

**What reviewers look at:**
- Is the code correct and working?
- Are locators reliable?
- Are test names descriptive?
- Is anything missing or unnecessary?

**Reviewers can:**
- **Approve** — changes look good, ready to merge
- **Request changes** — leave comments asking you to fix or improve something
- **Comment** — ask questions or suggest alternatives without blocking the merge

**If changes are requested:**
1. Read the reviewer's comments carefully
2. Make the fixes on your local machine (same branch)
3. Commit the fixes:
   ```bash
   git add .
   git commit -m "Address review feedback: improve locator specificity"
   ```
4. Push again — the PR updates automatically:
   ```bash
   git push origin add-login-tests
   ```
5. Reply to the reviewer's comments on GitHub to let them know you've addressed them

---

### Step 11 — Merge the Pull Request

Once the reviewer approves, the PR can be merged.

**If you have permission to merge:**
1. Go to the PR on GitHub
2. Click the green **Merge pull request** button
3. Click **Confirm merge**
4. Click **Delete branch** — the branch is no longer needed after merging

**If you don't have permission:**
The reviewer or repository owner will merge it for you after approving.

---

### Step 12 — Clean Up After Merging

After your PR is merged, update your local machine and fork:

**Switch back to main:**
```bash
git checkout main
```

**Pull the latest code (which now includes your merged changes):**
```bash
git pull upstream main
```

**Update your fork on GitHub:**
```bash
git push origin main
```

**Delete the branch locally (it's been merged, no longer needed):**
```bash
git branch -d add-login-tests
```

You are now ready to start the next piece of work from Step 4.

---

### Summary — The Complete Cycle

```
1. git fetch upstream          ← get latest from team
2. git checkout main
3. git merge upstream/main     ← update your main
4. git checkout -b my-branch   ← create new branch
5. ... make changes ...
6. npm test                    ← verify tests pass
7. git add .
8. git commit -m "message"
9. git push origin my-branch   ← push to your fork
10. Open Pull Request on GitHub
11. Address review feedback
12. PR gets approved and merged
13. git checkout main
14. git pull upstream main      ← sync after merge
15. git branch -d my-branch    ← clean up
```

---

### Common Mistakes to Avoid

| Mistake | Why it's a problem | What to do instead |
|---|---|---|
| Committing directly to `main` | Bypasses the review process | Always create a branch first |
| Committing `.env.test` | Exposes passwords publicly | Check `git status` before every commit |
| Writing vague commit messages | Makes history impossible to read | Write specific, descriptive messages |
| Not pulling latest before starting | Your code may conflict with recent changes | Always run `git fetch upstream` first |
| Opening a PR without running tests | Broken code goes up for review | Always run `npm test` before pushing |
| One massive PR with many changes | Hard to review, hard to undo | Keep PRs small and focused on one thing |

---

*This document was written for the CRM E2E test project. If you find anything outdated, update this file alongside the code change.*
