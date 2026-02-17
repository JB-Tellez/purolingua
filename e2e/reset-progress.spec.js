import { test, expect } from '@playwright/test';

// R1–R4: Reset Progress (High Priority)
//
// The reset button is always visible in the nav. It shows a confirm modal;
// confirming clears the "it-progress" key from localStorage and re-renders
// the deck grid with full due counts.

const SOME_PROGRESS = {
    'daily_0': { box: 3, nextReview: '2099-12-31' },
    'daily_1': { box: 2, nextReview: '2099-12-31' },
    'daily_2': { box: 1, nextReview: '2099-12-31' },
};

const ALL_DAILY_CARDS_DONE = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [`daily_${i}`, { box: 3, nextReview: '2099-12-31' }])
);

test.describe('Reset Progress', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('R1 - clicking the Reset button shows the confirmation modal', async ({ page }) => {
        await page.goto('/?lang=it');

        await page.locator('#reset-progress-btn').click();

        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);
        await expect(page.locator('#modal-title')).toContainText('Conferma reset');
        await expect(page.locator('#modal-cancel-btn')).toBeVisible();
        await expect(page.locator('#modal-confirm-btn')).toBeVisible();
    });

    test('R2 - cancelling the reset modal leaves progress intact', async ({ page }) => {
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            SOME_PROGRESS
        );
        await page.goto('/?lang=it');

        await page.locator('#reset-progress-btn').click();
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);

        // Cancel the reset
        await page.locator('#modal-cancel-btn').click();

        await expect(page.locator('#custom-modal')).toHaveClass(/hidden/);

        // Verify progress still in localStorage
        const saved = await page.evaluate(() => localStorage.getItem('it-progress'));
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved);
        expect(parsed['daily_0']).toBeDefined();
        expect(parsed['daily_0'].box).toBe(3);
    });

    test('R3 - confirming the reset removes progress from localStorage', async ({ page }) => {
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            SOME_PROGRESS
        );
        await page.goto('/?lang=it');

        await page.locator('#reset-progress-btn').click();
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);

        // Confirm the reset
        await page.locator('#modal-confirm-btn').click();

        // Dismiss the follow-up success alert
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);
        await page.locator('#modal-confirm-btn').click();

        // Progress key should be gone
        const saved = await page.evaluate(() => localStorage.getItem('it-progress'));
        expect(saved).toBeNull();
    });

    test('R4 - after confirming reset, deck badges show full due counts again', async ({ page }) => {
        // Start with all daily deck cards marked as completed
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ALL_DAILY_CARDS_DONE
        );
        await page.goto('/?lang=it');

        // Verify the deck shows "Completato" before reset
        const dailyBadge = page.locator('.deck-card')
            .filter({ hasText: 'Vita Quotidiana' })
            .locator('.deck-card-badge');
        await expect(dailyBadge).toHaveText('Completato');

        // Reset progress
        await page.locator('#reset-progress-btn').click();
        await page.locator('#modal-confirm-btn').click();

        // Dismiss the success alert
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);
        await page.locator('#modal-confirm-btn').click();

        // Badge should now show all 20 cards as due
        await expect(dailyBadge).toHaveText('20 carte');
    });
});
