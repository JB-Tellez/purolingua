import { test, expect } from '@playwright/test';

// D1, D2, D3, D5, D6: Deck Selection (High Priority)
//
// Seeding strategy: addInitScript scripts accumulate and run in registration
// order on every page.goto. beforeEach registers a localStorage.clear() first,
// so any seed added inside a test runs after the clear.

// Italian locale has 8 decks, each with 20 cards.
// Known deck: id="daily", title="Vita Quotidiana", 20 cards (indices 0–19).

const ALL_DAILY_CARDS_DONE = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [`daily_${i}`, { box: 3, nextReview: '2099-12-31' }])
);

test.describe('Deck Selection', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('D1 - all 8 Italian decks render in the grid', async ({ page }) => {
        await page.goto('/?lang=it');

        await expect(page.locator('.deck-card')).toHaveCount(8);
    });

    test('D2 - each deck card shows an icon, title, and description', async ({ page }) => {
        await page.goto('/?lang=it');

        const decks = page.locator('.deck-card');
        const count = await decks.count();

        for (let i = 0; i < count; i++) {
            const deck = decks.nth(i);
            await expect(deck.locator('.deck-icon-circle')).toBeVisible();
            await expect(deck.locator('h3')).toBeVisible();
            await expect(deck.locator('p')).toBeVisible();
            await expect(deck.locator('.deck-card-badge')).toBeVisible();
        }
    });

    test('D3 - fresh session shows full due-card count badge (20 carte)', async ({ page }) => {
        await page.goto('/?lang=it');

        const dailyDeck = page.locator('.deck-card').filter({ hasText: 'Vita Quotidiana' });
        await expect(dailyDeck.locator('.deck-card-badge')).toHaveText('20 carte');
    });

    test('D5 - clicking a deck with due cards switches to flashcard view', async ({ page }) => {
        await page.goto('/?lang=it');

        await page.locator('.deck-card').first().click();

        await expect(page.locator('#flashcard-view')).not.toHaveClass(/hidden/);
        await expect(page.locator('#deck-selection')).toHaveClass(/hidden/);
    });

    test('D6 - clicking a deck with 0 due cards shows alert and stays on deck selection', async ({ page }) => {
        await page.addInitScript(
            (progress) => localStorage.setItem('it-progress', JSON.stringify(progress)),
            ALL_DAILY_CARDS_DONE
        );
        await page.goto('/?lang=it');

        await page.locator('.deck-card').filter({ hasText: 'Vita Quotidiana' }).click();

        // Alert modal should appear with the "deck complete" title
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);
        await expect(page.locator('#modal-title')).toContainText('Completato! ✓');

        // Deck selection should remain visible
        await expect(page.locator('#deck-selection')).not.toHaveClass(/hidden/);
        await expect(page.locator('#flashcard-view')).toHaveClass(/hidden/);
    });
});
