const puppeteer = require('puppeteer');

describe('Mentus Knowledge Instructor Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('chrome-extension://mentus/popup.html');
  });

  test('should add subject correctly', async () => {
    await page.type('#subject', 'Mathematics');
    await page.click('#addSubject');
    const alertText = await page.evaluate(() => window.alert);
    expect(alertText).toBe('Added Subject: Mathematics');
  });

  afterAll(async () => {
    await browser.close();
  });
});
