import { expect, test, type Page } from '@playwright/test';
import { requireLocalConvex } from './convexPreflight';

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function makeCredentials(label: string) {
    return {
        email: `${label}-${runId}@example.test`,
        password: `Task7-${runId}-Password!`,
    };
}

async function signUpWithPassword(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.getByTestId('auth-flow-toggle').click();
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('auth-submit-button').click();

    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('authenticated-header-state')).toBeVisible();
}

async function signUpAndSaveDiagram(page: Page, label: string) {
    const { email, password } = makeCredentials(label);
    await signUpWithPassword(page, email, password);

    const preview = page.locator('iframe[title="Diagram preview"]');
    await expect(preview).toBeVisible();
    const previewSrc = await preview.getAttribute('src');
    if (!previewSrc) {
        throw new Error('Expected a rendered preview URL before saving the diagram.');
    }

    await page.getByTestId('manual-save-button').click();
    await expect(page.getByText('Diagram saved')).toBeVisible();

    return { email, password, previewSrc };
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

test('authenticated dashboard shows a saved row, detail preview, and edit handoff', async ({ page }) => {
    const { previewSrc } = await signUpAndSaveDiagram(page, 'dashboard-edit');

    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-shell')).toBeVisible();
    await expect(page.getByTestId('diagram-table')).toBeVisible();

    const row = page.getByTestId('diagram-row').first();
    await expect(row).toBeVisible();

    const diagramId = await row.getAttribute('data-diagram-id');
    if (!diagramId) {
        throw new Error('Expected saved dashboard row to expose a diagram id.');
    }

    await row.click();
    await expect(page.getByTestId('diagram-detail')).toBeVisible();
    await expect(page.getByTestId('diagram-preview')).toBeVisible();

    const detailEditButton = page.getByTestId('diagram-detail').getByTestId('edit-diagram-button');
    await detailEditButton.click();

    await page.waitForURL((url) => url.pathname === '/' && url.searchParams.get('diagramId') === diagramId);
    const returnedUrl = new URL(page.url());
    expect(returnedUrl.pathname).toBe('/');
    expect(returnedUrl.searchParams.get('diagramId')).toBe(diagramId);
    await expect(page.getByTestId('diagram-load-state')).toHaveText(new RegExp(`Diagram ${diagramId}: loaded`));
    await expect(page.locator('iframe[title="Diagram preview"]')).toHaveAttribute('src', previewSrc);
});

test('fresh dashboard accounts show the empty state', async ({ page }) => {
    const { email, password } = makeCredentials('dashboard-empty');
    await signUpWithPassword(page, email, password);

    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-shell')).toBeVisible();
    await expect(page.getByTestId('empty-diagrams-state')).toBeVisible();
});

test('dashboard delete cancel keeps the row and confirm clears the last saved diagram', async ({ page }) => {
    await signUpAndSaveDiagram(page, 'dashboard-delete');

    await page.getByTestId('dashboard-navigation-link').click();
    await expect(page.getByTestId('diagram-table')).toBeVisible();

    const row = page.getByTestId('diagram-row').first();
    await expect(row).toBeVisible();

    await row.getByTestId('delete-diagram-button').click();
    await expect(page.getByTestId('confirm-delete-modal')).toBeVisible();

    await page.getByTestId('cancel-delete-button').click();
    await expect(page.getByTestId('confirm-delete-modal')).toHaveCount(0);
    await expect(page.getByTestId('diagram-row')).toHaveCount(1);

    await row.getByTestId('delete-diagram-button').click();
    await expect(page.getByTestId('confirm-delete-modal')).toBeVisible();
    await page.getByTestId('confirm-delete-button').click();

    await expect(page.getByTestId('confirm-delete-modal')).toHaveCount(0);
    await expect(page.getByTestId('diagram-row')).toHaveCount(0);
    await expect(page.getByTestId('empty-diagrams-state')).toBeVisible();
});
