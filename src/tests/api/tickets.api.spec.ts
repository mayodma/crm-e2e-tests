import { test, expect } from '@playwright/test';

// We need a token to call the API. Get it from Keycloak directly.
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

test.describe('Ticket API', () => {
    let token: string;

    // Run once before all tests in this file
    test.beforeAll(async () => {
        token = await getToken();
    });

    test('GET /api/tickets returns a list', async ({ request }) => {
        const response = await request.get(`${process.env.TICKET_API_URL}/api/tickets`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty('items');          // API pagination object
        expect(Array.isArray(body.items)).toBe(true);
    });

    test('GET /api/tickets returns correct shape per ticket', async ({ request }) => {
        const response = await request.get(`${process.env.TICKET_API_URL}/api/tickets`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();

        if (body.items.length > 0) {
            const ticket = body.items[0];
            expect(ticket).toHaveProperty('ticketId');
            expect(ticket).toHaveProperty('status');
            expect(ticket).toHaveProperty('ticketNumber');
        }
    });

    test('GET /api/tickets/{id} returns 404 for non-existent ticket', async ({ request }) => {
        const response = await request.get(
            `${process.env.TICKET_API_URL}/api/tickets/00000000-0000-0000-0000-000000000000`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        expect(response.status()).toBe(404);
    });
});
