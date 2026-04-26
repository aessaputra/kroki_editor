import { expect, test, type Page } from '@playwright/test';
import { requireLocalConvex } from './convexPreflight';

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function makeCredentials(label: string) {
    return {
        email: `${label}-${runId}@example.test`,
        password: `Task5-${runId}-Password!`,
    };
}

async function signUpWithPassword(page: Page, email: string, password: string) {
    await page.goto('/register');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-shell')).toBeVisible();

    await page.goto('/');
    await expect(page.getByTestId('authenticated-header-state')).toBeVisible();
}

test.beforeAll(async () => {
    await requireLocalConvex();
});

test('guest dashboard access redirects to login with return intent', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login\?next=\/dashboard$/);
    await expect(page.getByTestId('email-password-auth-form')).toBeVisible();

    const currentUrl = new URL(page.url());
    expect(currentUrl.pathname).toBe('/login');
    expect(currentUrl.searchParams.get('next')).toBe('/dashboard');
});

test('auth routes use route-specific modes, reciprocal links, and safe returns', async ({ page }) => {
    const { email, password } = makeCredentials('auth-routes');

    await page.goto('/login');
    await expect(page.getByTestId('email-password-auth-form')).toBeVisible();
    await expect(page.getByRole('heading', { name: /login.*diagram dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    await expect(page.getByTestId('auth-flow-toggle')).toHaveCount(0);

    await page.goto('/register');
    await expect(page.getByTestId('email-password-auth-form')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create.*diagram dashboard account/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    await expect(page.getByTestId('auth-flow-toggle')).toHaveCount(0);

    await page.goto('/register?next=https://evil.example');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');

    await page.getByTestId('dashboard-logout-button').click();
    await expect(page).toHaveURL('/');

    await page.goto('/login?next=/dashboard');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
});

test('authenticated dashboard shows empty state and editor handoff without manual save CTA', async ({ page }) => {
    const { email, password } = makeCredentials('dashboard-handoff');
    await signUpWithPassword(page, email, password);

    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-shell')).toBeVisible();
    await expect(page.getByTestId('dashboard-logout-button')).toBeVisible();
    await expect(page.getByTestId('empty-diagrams-state')).toBeVisible();

    await page.getByTestId('dashboard-open-editor-link').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('authenticated-header-state')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-open-button')).toBeVisible();
    await expect(page.getByTestId('manual-save-button')).toHaveCount(0);
    await expect(page.getByTestId('login-to-save-link')).toHaveCount(0);
    await expect(page.getByTestId('register-navigation-link')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('my-diagrams-open-button')).toBeVisible();
    await expect(page.getByTestId('my-diagrams-open-button-mobile')).toHaveCount(0);
    await expect(page.getByTestId('register-navigation-link')).toHaveCount(0);
});

test('fresh dashboard accounts show the empty state', async ({ page }) => {
    const { email, password } = makeCredentials('dashboard-empty');
    await signUpWithPassword(page, email, password);

    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-shell')).toBeVisible();
    await expect(page.getByTestId('empty-diagrams-state')).toBeVisible();
});
