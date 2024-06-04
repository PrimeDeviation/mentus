const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Options</title>
    <link rel="stylesheet" href="../components/navbar/navbar.css">
</head>
<body>
    <div id="app">
        <div id="navbar-container">
            <nav class="navbar">
                <ul>
                    <li><a href="#" id="graph-view">Graph View</a></li>
                    <li><a href="#" id="documents">Documents/Files</a></li>
                    <li><a href="#" id="editor">Editor</a></li>
                    <li><a href="#" id="settings">Settings</a></li>
                </ul>
            </nav>
        </div>
        <div id="content-container">
            <div id="graphview" style="display: none;">Graph View Content</div>
            <div id="documents" style="display: none;">Documents/Files Content</div>
            <div id="editor" style="display: none;">Editor Content</div>
            <div id="settings" style="display: none;">Settings Content</div>
        </div>
    </div>
    <script src="../components/navbar/navbar.js"></script>
</body>
</html>`, { runScripts: "dangerously", resources: "usable" });

const { window } = dom;
const { document } = window;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('graph-view').click();
    console.log(document.getElementById('graphview').style.display); // should be 'block'

    document.getElementById('documents').click();
    console.log(document.getElementById('documents').style.display); // should be 'block'

    document.getElementById('editor').click();
    console.log(document.getElementById('editor').style.display); // should be 'block'

    document.getElementById('settings').click();
    console.log(document.getElementById('settings').style.display); // should be 'block'
});
