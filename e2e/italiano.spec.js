import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/?lang=it');
  await page.getByText('☀️ Vita Quotidiana Frasi').click();
  await page.getByRole('button', { name: 'Gira' }).click();
  const phraseButton = page.getByRole('button', { name: /^🔊/ }).first();
  await expect(phraseButton).toBeVisible();
  await phraseButton.click();
});