
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('H5Test_2026-03-29', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:8090');

    // Navigate to URL
    await page.goto('http://localhost:8090');

    // Take screenshot
    await page.screenshot({ path: 'h5_homepage.png' });

    // Navigate to URL
    await page.goto('http://localhost:8090');

    // Take screenshot
    await page.screenshot({ path: 'h5_homepage_fixed.png' });

    // Click element
    await page.click('text=错题本');

    // Take screenshot
    await page.screenshot({ path: 'h5_questions.png' });
});