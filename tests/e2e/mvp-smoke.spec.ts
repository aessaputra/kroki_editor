import { expect, test } from '@playwright/test';
import { requireLocalConvex } from './convexPreflight';

const uniqueRunId = Date.now();
const email = process.env.E2E_TEST_EMAIL ?? `task5-${uniqueRunId}@example.test`;
const password = process.env.E2E_TEST_PASSWORD ?? `Task5-${uniqueRunId}-password!`;

test.beforeAll(async () => {
    await requireLocalConvex();
});

test('guest can edit and preview with Register CTA and no save/history controls', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Diagram Preview')).toBeVisible();
    await expect(page.locator('iframe[title="Diagram preview"]')).toBeVisible();
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
    await expect(page.getByTestId('manual-save-button')).toHaveCount(0);
    await expect(page.getByTestId('login-to-save-link')).toHaveCount(0);
    await expect(page.getByText('Login to save')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button-mobile')).toHaveCount(0);
    await expect(page.getByText(/Generate with AI|Owner Console|Owner Login/i)).toHaveCount(0);
});

test('guest mobile editor hides My Diagrams while keeping Register available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
    await expect(page.getByTestId('manual-save-button')).toHaveCount(0);
    await expect(page.getByTestId('login-to-save-link')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button-mobile')).toHaveCount(0);
});

test('email signup/login preserves authenticated editor navigation controls', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL('/dashboard');
    await page.goto('/');
    await expect(page.getByTestId('authenticated-header-state')).toBeVisible();
    await expect(page.getByTestId('dashboard-navigation-link')).toBeVisible();
    await expect(page.getByTestId('header-logout-button')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button')).toBeVisible();
    await expect(page.getByTestId('register-navigation-link')).toHaveCount(0);
    await expect(page.getByTestId('manual-save-button')).toHaveCount(0);
    await expect(page.getByTestId('login-to-save-link')).toHaveCount(0);

    await page.getByTestId('my-diagrams-open-button').click();
    await expect(page.getByTestId('my-diagrams-sidebar')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-auth-prompt')).toHaveCount(0);

    await page.getByTestId('my-diagrams-close-button').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('register-navigation-link')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-open-button-mobile')).toHaveCount(0);
    await page.getByTestId('my-diagrams-open-button').click();
    await expect(page.getByTestId('my-diagrams-sidebar')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-auth-prompt')).toHaveCount(0);
    await page.getByTestId('my-diagrams-close-button').click();
    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page.getByTestId('dashboard-logout-button')).toBeVisible();
    await page.getByTestId('dashboard-logout-button').click();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.getByTestId('my-diagrams-open-button')).toHaveCount(0);
    await expect(page.getByTestId('my-diagrams-open-button-mobile')).toHaveCount(0);
});

test('/owner is absent and does not expose the removed owner UI', async ({ page }) => {
    const response = await page.goto('/owner');
    expect(response?.status()).toBe(404);

    await expect(page.getByText(/Owner Console|Owner Login|magic link|OAuth|password reset/i)).toHaveCount(0);
});
