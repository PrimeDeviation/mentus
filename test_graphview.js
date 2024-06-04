const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/components/mentus_tab.html');

    // Check if the graphview is loaded
    const graphViewLoaded = await page.evaluate(() => {
        const contentFrame = document.getElementById('content-frame');
        return contentFrame && contentFrame.getAttribute('data') === '../components/graphview/graphview.html';
    });

    console.log('Graph View Loaded:', graphViewLoaded);

    // Check if the graph is rendered
    const graphRendered = await page.evaluate(() => {
        const svg = document.querySelector('#graph-container svg');
        return svg !== null;
    });

    console.log('Graph Rendered:', graphRendered);

    await browser.close();
})();
