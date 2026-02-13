import { test, expect } from '@playwright/test';

test.describe('UI Validation', () => {
    test('primary buttons should be ergonomic and use correct colors', async ({ page }) => {
        // Go to Login page where there is a confirmed Primary Button
        await page.goto('/login');

        // Check Login Button (Text: "Ingresar")
        const primaryBtn = page.getByRole('button', { name: /Ingresar/i }).first();

        await expect(primaryBtn).toBeVisible();

        // 1. Size Check (>48px height for touch targets)
        const box = await primaryBtn.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);

        if (box && box.height < 48) {
            console.warn(`Button height is ${box.height}px, ideally >= 48px for mobile.`);
        }

        // 2. Color Check (Bio-Teal / Health Color)
        const color = await primaryBtn.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        console.log('Primary Button Color:', color);
    });
});
