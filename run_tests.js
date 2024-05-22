const fs = require('fs');
const { JSDOM } = require('jsdom');

// Load the HTML content from test_config.html
const htmlContent = fs.readFileSync('test_config.html', 'utf8');

// Create a DOM environment
const dom = new JSDOM(htmlContent, { runScripts: 'dangerously', resources: 'usable' });

// Wait for the DOM to be fully loaded
dom.window.document.addEventListener('DOMContentLoaded', () => {
  // Load and execute the test_config.js script
  const scriptContent = fs.readFileSync('test_config.js', 'utf8');
  const scriptElement = dom.window.document.createElement('script');
  scriptElement.textContent = scriptContent;
  dom.window.document.body.appendChild(scriptElement);
});
