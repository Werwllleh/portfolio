import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Test (1440x900)
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://127.0.0.1:6002', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Take dark theme screenshots
  await desktopPage.screenshot({ path: 'scripts/screenshots/theme-dark.png', fullPage: false });
  await desktopPage.screenshot({ path: 'scripts/screenshots/desktop-full-dark.png', fullPage: true });

  // Click visible desktop fixed theme toggle in top-right corner
  const desktopToggle = desktopPage.locator('.fixed.top-6.right-6 button');
  if (await desktopToggle.isVisible()) {
    await desktopToggle.click();
    await desktopPage.waitForTimeout(1000); // wait for 450ms smooth transition
    console.log('Desktop switched to light theme!');
    await desktopPage.screenshot({ path: 'scripts/screenshots/theme-light.png', fullPage: false });
    await desktopPage.screenshot({ path: 'scripts/screenshots/desktop-full-light.png', fullPage: true });
  }

  // 2. Mobile Test (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobilePage.goto('http://127.0.0.1:6002', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'scripts/screenshots/theme-mobile-dark.png', fullPage: false });

  // Click mobile theme toggle in status bar
  const mobileToggle = mobilePage.locator('.lg\\:hidden button');
  if (await mobileToggle.isVisible()) {
    await mobileToggle.click();
    await mobilePage.waitForTimeout(1000);
    console.log('Mobile switched to light theme!');
    await mobilePage.screenshot({ path: 'scripts/screenshots/theme-mobile-light.png', fullPage: false });
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
