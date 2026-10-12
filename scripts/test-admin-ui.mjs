import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // 1. Login
  await page.goto('http://127.0.0.1:6002/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@proaaa.ru');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Logged in URL:', page.url());

  // 2. Go to Site Settings
  await page.goto('http://127.0.0.1:6002/admin/globals/site-settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Site Settings URL:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/admin-site-settings.png', fullPage: true });

  // 3. Go to Projects
  await page.goto('http://127.0.0.1:6002/admin/collections/projects/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Project Edit URL:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/admin-project-edit.png', fullPage: true });

  await browser.close();
  console.log('Verification screenshots saved!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
