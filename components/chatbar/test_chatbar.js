const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto(`file://${__dirname}/test_chatbar.html`);

    // Wait for the chat input to be visible
    await page.waitForSelector('#chat-input');

    // Type a message and click send
    await page.type('#chat-input', 'Hello, world!');
    await page.click('#send-button');

    // Wait for the message to appear in the chat
    await page.waitForSelector('.message');

    console.log('Test completed successfully.');

    await browser.close();
})();
