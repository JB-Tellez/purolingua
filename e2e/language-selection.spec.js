import { test, expect } from '@playwright/test';

// L1-L5: Language Selection (High Priority)
// All tests clear localStorage via addInitScript before the page loads.

test.describe('Language Selection', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('L1 - shows language modal on first visit (no lang param, no localStorage)', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#language-modal')).not.toHaveClass(/hidden/);
        await expect(page.locator('#language-choices')).toBeVisible();
        // Deck grid should be empty before language is chosen
        await expect(page.locator('.deck-card')).toHaveCount(0);
    });

    test('L2 - selecting Italian hides modal and renders Italian decks', async ({ page }) => {
        await page.goto('/');

        await page.locator('.language-choice').filter({ hasText: 'Italiano' }).click();

        await expect(page.locator('#language-modal')).toHaveClass(/hidden/);
        await expect(page.locator('.deck-card').first()).toBeVisible();
        await expect(page.locator('#logo')).toContainText('🇮🇹');
    });

    test('L3 - selecting Spanish hides modal and renders Spanish decks', async ({ page }) => {
        await page.goto('/');

        await page.locator('.language-choice').filter({ hasText: 'Español' }).click();

        await expect(page.locator('#language-modal')).toHaveClass(/hidden/);
        await expect(page.locator('.deck-card').first()).toBeVisible();
        await expect(page.locator('#logo')).toContainText('🇪🇸');
    });

    test('L4 - ?lang=it in URL skips modal and loads Italian directly', async ({ page }) => {
        await page.goto('/?lang=it');

        await expect(page.locator('#language-modal')).toHaveClass(/hidden/);
        await expect(page.locator('#deck-selection')).not.toHaveClass(/hidden/);
        await expect(page.locator('#logo')).toContainText('🇮🇹');
        await expect(page.locator('.deck-card').first()).toBeVisible();
    });

    test('L5 - ?lang=es in URL skips modal and loads Spanish directly', async ({ page }) => {
        await page.goto('/?lang=es');

        await expect(page.locator('#language-modal')).toHaveClass(/hidden/);
        await expect(page.locator('#deck-selection')).not.toHaveClass(/hidden/);
        await expect(page.locator('#logo')).toContainText('🇪🇸');
        await expect(page.locator('.deck-card').first()).toBeVisible();
    });
});
