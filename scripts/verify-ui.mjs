import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function verify() {
  const screenshotsDir = path.resolve(process.cwd(), 'scripts/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();

  const consoleErrors = [];
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await desktopPage.goto('http://127.0.0.1:6002', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000); // Wait for R3F Canvas to render

  const rootFontSize = await desktopPage.evaluate(() => window.getComputedStyle(document.documentElement).fontSize);
  const containerWidth = await desktopPage.evaluate(() => {
    const el = document.querySelector('.max-w-screen-xl');
    return el ? window.getComputedStyle(el).width : null;
  });
  const bodyBg = await desktopPage.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  const bodyColor = await desktopPage.evaluate(() => window.getComputedStyle(document.body).color);

  console.log(`[VERIFY DESKTOP] Root Font Size: ${rootFontSize}`);
  console.log(`[VERIFY DESKTOP] Container Width: ${containerWidth}`);
  console.log(`[VERIFY DESKTOP] Body Background: ${bodyBg}`);
  console.log(`[VERIFY DESKTOP] Body Text Color: ${bodyColor}`);

  await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop-fixed.png'), fullPage: false });
  await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop-full-fixed.png'), fullPage: true });

  // 2. Mobile Test
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:6002', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile-fixed.png'), fullPage: false });

  await browser.close();

  console.log(`Console Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }
  console.log('--- Verification complete, screenshots saved! ---');
}

verify().catch(console.error);
