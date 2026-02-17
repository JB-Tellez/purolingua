import { test, expect } from '@playwright/test';

// C1, C2, C7, F1, F2, F5, Q1–Q6, N1–N4: Flashcard view (High Priority)
//
// Seeding strategy:
//   ONE_CARD_DUE  – only daily card 0 is due  → front: "Ho perso il treno."
//                                              → correct back: "Non sono arrivato in tempo alla stazione."
//   TWO_CARDS_DUE – daily cards 0 and 1 are due (card 1 front: "Dove posso comprare i biglietti?")
//
// The Italian Leitner storage key is "it-progress".

const CORRECT_FRONT = 'Ho perso il treno.';
const CORRECT_BACK = 'Non sono arrivato in tempo alla stazione.';

/** Progress object where only daily card 0 is due (cards 1–19 have future review dates). */
const ONE_CARD_DUE = Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [`daily_${i + 1}`, { box: 3, nextReview: '2099-12-31' }])
);

/** Progress object where only daily cards 0 and 1 are due (cards 2–19 are done). */
const TWO_CARDS_DUE = Object.fromEntries(
    Array.from({ length: 18 }, (_, i) => [`daily_${i + 2}`, { box: 3, nextReview: '2099-12-31' }])
);

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Navigate into the daily deck's flashcard view. */
async function openDailyDeck(page) {
    await page.locator('.deck-card').filter({ hasText: 'Vita Quotidiana' }).click();
    await expect(page.locator('#flashcard-view')).not.toHaveClass(/hidden/);
}

/** Flip the current card using the Flip button. */
async function flipCard(page) {
    await page.locator('#flip-btn').click();
    await expect(page.locator('#current-card')).toHaveClass(/flipped/);
}

// ---------------------------------------------------------------------------
// C – Card Rendering
// ---------------------------------------------------------------------------

test.describe('Card Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ONE_CARD_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);
    });

    test('C1 - card front text matches the due card from the selected deck', async ({ page }) => {
        // With ONE_CARD_DUE, only daily card 0 is due.
        await expect(page.locator('#card-front-text')).toHaveText(CORRECT_FRONT);
    });

    test('C2 - exactly 4 quiz options are rendered', async ({ page }) => {
        await flipCard(page);
        await expect(page.locator('.quiz-btn')).toHaveCount(4);
    });

    test('C7 - back button is visible while in flashcard view', async ({ page }) => {
        await expect(page.locator('#back-button')).not.toHaveClass(/hidden/);
    });
});

// ---------------------------------------------------------------------------
// F – Card Flip
// ---------------------------------------------------------------------------

test.describe('Card Flip', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ONE_CARD_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);
    });

    test('F1 - clicking the card front text adds the flipped class', async ({ page }) => {
        const card = page.locator('#current-card');

        // Initially unflipped
        await expect(card).not.toHaveClass(/flipped/);

        // Click the card body (front text paragraph, not a button)
        await page.locator('#card-front-text').click();
        await expect(card).toHaveClass(/flipped/);

        // Flip back using the dedicated button (the front face is hidden by CSS 3D
        // transform once flipped, so clicking it again is not possible from here)
        await page.locator('#flip-btn').click();
        await expect(card).not.toHaveClass(/flipped/);
    });

    test('F2 - the Flip button toggles the flipped class', async ({ page }) => {
        const card = page.locator('#current-card');

        await expect(card).not.toHaveClass(/flipped/);
        await page.locator('#flip-btn').click();
        await expect(card).toHaveClass(/flipped/);
        await page.locator('#flip-btn').click();
        await expect(card).not.toHaveClass(/flipped/);
    });

    test('F5 - new card loads without the flipped class after clicking Next', async ({ page }) => {
        // Re-seed with two due cards so Next can advance
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            TWO_CARDS_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);

        const card = page.locator('#current-card');

        // Flip the first card
        await page.locator('#flip-btn').click();
        await expect(card).toHaveClass(/flipped/);

        // Advance to next card
        await page.locator('#next-btn').click();

        // New card should start unflipped
        await expect(card).not.toHaveClass(/flipped/);
    });
});

// ---------------------------------------------------------------------------
// Q – Quiz Answer Handling
// ---------------------------------------------------------------------------

test.describe('Quiz Answer Handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ONE_CARD_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);
        await flipCard(page);
    });

    test('Q1 - clicking the correct answer adds the correct class to that button', async ({ page }) => {
        const correctBtn = page.locator('.quiz-btn').filter({ hasText: CORRECT_BACK });

        await correctBtn.click();

        await expect(correctBtn).toHaveClass(/correct/);
    });

    test('Q2 - clicking the correct answer shows positive feedback', async ({ page }) => {
        await page.locator('.quiz-btn').filter({ hasText: CORRECT_BACK }).click();

        await expect(page.locator('#feedback-message')).not.toHaveClass(/hidden/);
        await expect(page.locator('#feedback-message')).toContainText('Corretto');
        await expect(page.locator('#feedback-message')).toHaveClass(/correct/);
    });

    test('Q3 - clicking a wrong answer adds the incorrect class to that button', async ({ page }) => {
        const wrongBtn = page.locator('.quiz-btn').filter({ hasNotText: CORRECT_BACK }).first();

        await wrongBtn.click();

        await expect(wrongBtn).toHaveClass(/incorrect/);
    });

    test('Q4 - clicking a wrong answer highlights the correct answer button', async ({ page }) => {
        const wrongBtn = page.locator('.quiz-btn').filter({ hasNotText: CORRECT_BACK }).first();
        const correctBtn = page.locator('.quiz-btn').filter({ hasText: CORRECT_BACK });

        await wrongBtn.click();

        await expect(correctBtn).toHaveClass(/correct/);
    });

    test('Q5 - clicking a wrong answer shows negative feedback', async ({ page }) => {
        const wrongBtn = page.locator('.quiz-btn').filter({ hasNotText: CORRECT_BACK }).first();

        await wrongBtn.click();

        await expect(page.locator('#feedback-message')).not.toHaveClass(/hidden/);
        await expect(page.locator('#feedback-message')).toContainText('Riprova');
        await expect(page.locator('#feedback-message')).toHaveClass(/incorrect/);
    });

    test('Q6 - clicking a second answer after answering has no effect', async ({ page }) => {
        // Answer with any button
        await page.locator('.quiz-btn').first().click();

        // Record how many buttons are styled (1 if correct, 2 if incorrect)
        const styledCount = await page.locator('.quiz-btn.correct, .quiz-btn.incorrect').count();

        // Click a button that currently has no answer class
        const unAnsweredBtn = page.locator('.quiz-btn:not(.correct):not(.incorrect)').first();
        if (await unAnsweredBtn.count() > 0) {
            await unAnsweredBtn.click();
        }

        // The styled count must not have increased
        await expect(page.locator('.quiz-btn.correct, .quiz-btn.incorrect')).toHaveCount(styledCount);
    });
});

// ---------------------------------------------------------------------------
// N – Navigation
// ---------------------------------------------------------------------------

test.describe('Navigation', () => {
    test('N1 - Next button advances to the second due card', async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            TWO_CARDS_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);

        const firstText = await page.locator('#card-front-text').textContent();

        await page.locator('#next-btn').click();

        const secondText = await page.locator('#card-front-text').textContent();
        expect(secondText).not.toBe(firstText);
    });

    test('N2 - after the last card, a completion alert is shown', async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ONE_CARD_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);

        // With 1 due card, clicking Next immediately triggers the completion alert
        await page.locator('#next-btn').click();

        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);
        await expect(page.locator('#modal-title')).toContainText('Complimenti');
    });

    test('N3 - dismissing the completion alert returns to deck selection', async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.addInitScript(
            (p) => localStorage.setItem('it-progress', JSON.stringify(p)),
            ONE_CARD_DUE
        );
        await page.goto('/?lang=it');
        await openDailyDeck(page);

        await page.locator('#next-btn').click();
        await expect(page.locator('#custom-modal')).not.toHaveClass(/hidden/);

        // Dismiss the alert
        await page.locator('#modal-confirm-btn').click();

        await expect(page.locator('#custom-modal')).toHaveClass(/hidden/);
        await expect(page.locator('#deck-selection')).not.toHaveClass(/hidden/);
        await expect(page.locator('#flashcard-view')).toHaveClass(/hidden/);
    });

    test('N4 - Back button returns to deck selection', async ({ page }) => {
        await page.addInitScript(() => localStorage.clear());
        await page.goto('/?lang=it');
        await openDailyDeck(page);

        await page.locator('#back-button').click();

        await expect(page.locator('#deck-selection')).not.toHaveClass(/hidden/);
        await expect(page.locator('#flashcard-view')).toHaveClass(/hidden/);
        await expect(page.locator('#back-button')).toHaveClass(/hidden/);
    });
});
