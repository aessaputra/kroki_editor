import { expect, test } from '@playwright/test';
import { requireLocalConvex } from './convexPreflight';

const uniqueRunId = Date.now();
const email = process.env.E2E_TEST_EMAIL ?? `task7-${uniqueRunId}@example.test`;
const password = process.env.E2E_TEST_PASSWORD ?? `Task7-${uniqueRunId}-password!`;
const renamedTitle = `Task 7 Renamed ${uniqueRunId}`;

test.beforeAll(async () => {
    await requireLocalConvex();
});

test('guest can edit and preview, but Save requires login and creates no guest history', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Diagram Preview')).toBeVisible();
    await expect(page.locator('iframe[title="Diagram preview"]')).toBeVisible();
    await expect(page.getByTestId('manual-save-button')).toBeVisible();
    await expect(page.getByTestId('login-to-save-link')).toBeVisible();
    await expect(page.getByText(/Generate with AI|AnythingLLM|Owner Console|Owner Login/i)).toHaveCount(0);

    await page.getByTestId('my-diagrams-open-button').click();
    await expect(page.getByTestId('my-diagrams-sidebar')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-auth-prompt')).toBeVisible();
    await expect(page.getByTestId('my-diagram-list-item')).toHaveCount(0);
    await page.getByTestId('my-diagrams-close-button').click();

    await page.getByTestId('manual-save-button').click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('email-password-auth-form')).toBeVisible();
});

test('email signup/login can save, list, load, rename, delete, and removes deleted items', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-flow-toggle').click();
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('auth-submit-button').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('authenticated-header-state')).toBeVisible();

    await page.getByTestId('manual-save-button').click();
    await expect(page.getByText('Diagram saved')).toBeVisible();

    await page.getByTestId('my-diagrams-open-button').click();
    const savedItem = page.getByTestId('my-diagram-list-item').filter({ hasText: 'plantuml diagram' }).first();
    await expect(savedItem).toBeVisible();

    await savedItem.getByTestId('my-diagram-rename-button').click();
    await page.getByTestId('my-diagram-rename-input').fill(renamedTitle);
    await page.getByTestId('my-diagram-rename-save-button').click();
    await expect(page.getByTestId('my-diagram-title').filter({ hasText: renamedTitle })).toBeVisible();

    const renamedItem = page.getByTestId('my-diagram-list-item').filter({ hasText: renamedTitle }).first();
    await renamedItem.getByTestId('my-diagram-load-button').click();
    await expect(page.getByTestId('my-diagrams-sidebar')).toHaveCount(0);

    await page.getByTestId('my-diagrams-open-button').click();
    const loadedItem = page.getByTestId('my-diagram-list-item').filter({ hasText: renamedTitle }).first();
    await expect(loadedItem.getByTestId('current-saved-diagram-indicator')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await loadedItem.getByTestId('my-diagram-delete-button').click();
    await expect(page.getByText('Diagram deleted')).toBeVisible();
    await expect(page.getByTestId('my-diagram-title').filter({ hasText: renamedTitle })).toHaveCount(0);

    await page.getByTestId('my-diagrams-close-button').click();
    await page.getByTestId('header-logout-button').click();
    await expect(page.getByTestId('login-to-save-link')).toBeVisible();
});

test('/owner is absent and does not expose the removed owner UI', async ({ page }) => {
    const response = await page.goto('/owner');
    expect(response?.status()).toBe(404);

    await expect(page.getByText(/OWNER_SECRET_KEY|OWNER_EMAIL|pending_otp|owner_token|magic link|OAuth|password reset/i)).toHaveCount(0);
});
