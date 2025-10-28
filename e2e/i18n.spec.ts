import { test, expect } from '@playwright/test';

const expectDir = async (page: import('@playwright/test').Page, dir: 'rtl' | 'ltr') => {
  await expect(page.locator('html')).toHaveAttribute('dir', dir);
};

const headerLink = (page: import('@playwright/test').Page, name: string) => page.getByRole('link', { name });

test.describe('i18n routing and UI', () => {
  test('redirects / to /fa and sets locale cookie', async ({ page, context }) => {
    const res = await page.goto('/');
    // After redirect, URL should include /fa
    await expect(page).toHaveURL(/\/fa(\/)?$/);
    const cookies = await context.cookies();
    const locale = cookies.find((c) => c.name === 'locale');
    expect(locale?.value).toBe('fa');
  });

  test('sets html dir rtl for fa and ltr for en', async ({ page }) => {
    await page.goto('/fa');
    await expectDir(page, 'rtl');
    await page.goto('/en');
    await expectDir(page, 'ltr');
  });

  test('locale switcher preserves query and hash', async ({ page }) => {
    await page.goto('/en/courses?sort=popular#top');
    // On EN, the switcher link text is in Persian: "فارسی"
    await headerLink(page, 'فارسی').click();
    await expect(page).toHaveURL(/\/fa\/courses\?sort=popular#top$/);
  });

  test('localized routes render', async ({ page }) => {
    for (const path of ['/fa/courses', '/en/courses', '/fa/contact', '/en/contact']) {
      await page.goto(path);
      await expect(page.locator('header')).toBeVisible();
    }
  });
});
