mentus/
├── manifest.json
├── background.js
├── service-worker.js
├── content-scripts/
│   ├── content-script.js
│   └── content-style.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── images/
│   ├── icon_16.png
│   ├── icon_48.png
│   └── icon_128.png
├── styles/
│   └── main.css
└── components/
    ├── navbar/
    │   ├── navbar.html
    │   ├── navbar.js
    │   └── navbar.css
    ├── chatbar/
    │   ├── chatbar.html
    │   ├── chatbar.js
    │   └── chatbar.css
    ├── graphview/
    │   ├── graphview.html
    │   ├── graphview.js
    │   └── graphview.css
    ├── documents/
    │   ├── documents.html
    │   ├── documents.js
    │   └── documents.css
    ├── editor/
    │   ├── editor.html
    │   ├── editor.js
    │   └── editor.css
    └── settings/
        ├── settings.html
        ├── settings.js
        └── settings.css

### Key Components

#### 1. Manifest File (`manifest.json`)
The `manifest.json` file is the configuration file for the extension. It provides essential information such as the extension's name, version, permissions, and the files used by the extension.

Example:
```json
{
  "manifest_version": 3,
  "name": "Mentus",
  "version": "1.0.0",
  "description": "Curate learning content, validate user learning, and track user-generated content.",
  "icons": {
    "16": "images/icon_16.png",
    "48": "images/icon_48.png",
    "128": "images/icon_128.png"
  },
  "background": {
    "service_worker": "service-worker.js"
  },
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": "images/icon_48.png"
  },
  "options_page": "options/options.html",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-scripts/content-script.js"],
      "css": ["content-scripts/content-style.css"]
    }
  ]
}
```

2. Background Script (background.js)
The background script handles the main logic of the extension, including event listeners for browser events. It runs in the background and can manage tasks such as data processing and coordinating different parts of the extension.
3. Service Worker (service-worker.js)
The service worker is an event-based script that runs in the background. It listens for and reacts to events such as installation, tab creation, and bookmark additions. It can access all extension APIs but cannot directly modify web pages.
4. Content Scripts (content-scripts/content-script.js)
Content scripts are JavaScript files that run in the context of web pages. They can interact with and modify the DOM of the host pages. Content scripts are specified in the manifest.json file and can be injected into specified web pages.
5. Popup (popup/)
The popup directory contains the HTML, JavaScript, and CSS files for the extension's popup interface. The popup is displayed when the user clicks on the extension's toolbar icon.
6. Options Page (options/)
The options page allows users to customize the extension's settings. It includes HTML, JavaScript, and CSS files to create a user-friendly interface for configuration.
7. Components
The components directory contains the HTML, JavaScript, and CSS files for the main UI components of the extension:
Navbar (navbar/): Contains the navigation bar on the left side of the screen.
Chatbar (chatbar/): Contains the chat bar on the right side of the screen.
Graph View (graphview/): Displays the graph view in the central area.
Documents (documents/): Displays documents and files in the central area.
Editor (editor/): Provides an editor interface in the central area.
Settings (settings/): Contains the settings screen where users can configure the graph data source, chat model, file system source, various UI settings, and user profile information.
UI Layout and Interaction
Full Browser Tab UI
The entire browser tab is dedicated to the Mentus extension, with no external web content being displayed within this tab. The layout includes a navigation bar on the left, a chat bar on the right, and a central content area for displaying selected features.

HTML (index.html):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles/main.css">
  <title>Mentus</title>
</head>
<body>
  <div id="navbar"></div>
  <div id="content" class="content"></div>
  <div id="chatbar"></div>
  <script src="components/navbar/navbar.js"></script>
  <script src="components/chatbar/chatbar.js"></script>
</body>
</html>
```

CSS (main.css):
```css
body {
  display: flex;
  height: 100vh;
  margin: 0;
}

#navbar {
  width: 200px;
  background-color: #f1f1f1;
  overflow-y: auto;
  transition: width 0.5s;
}

#chatbar {
  width: 200px;
  background-color: #f1f1f1;
  overflow-y: auto;
  transition: width 0.5s;
}

#content {
  flex-grow: 1;
  overflow-y: auto;
  transition: margin 0.5s;
}
```

Navigation Bar (Nav Bar)
The nav bar provides navigation options to switch between different features such as graph view, documents/files, editor, and settings.

HTML (navbar.html):
```html
<div class="navbar">
  <ul>
    <li><a href="#" onclick="showGraphView()">Graph View</a></li>
    <li><a href="#" onclick="showDocuments()">Documents/Files</a></li>
    <li><a href="#" onclick="showEditor()">Editor</a></li>
    <li><a href="#" onclick="showSettings()">Settings</a></li>
  </ul>
</div>
```

CSS (navbar.css):
```css
.navbar {
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
}

.navbar ul {
  list-style-type: none;
  padding: 0;
}

.navbar ul li {
  padding: 8px;
  text-align: center;
}

.navbar ul li a {
  text-decoration: none;
  color: black;
  display: block;
  transition: 0.3s;
}

.navbar ul li a:hover {
  background-color: #555;
  color: white;
}
```

JavaScript (navbar.js):
```javascript
function showGraphView() {
  document.getElementById('content').innerHTML = '<object type="text/html" data="components/graphview/graphview.html"></object>';
}

function showDocuments() {
  document.getElementById('content').innerHTML = '<object type="text/html" data="components/documents/documents.html"></object>';
}

function showEditor() {
  document.getElementById('content').innerHTML = '<object type="text/html" data="components/editor/editor.html"></object>';
}

function showSettings() {
  document.getElementById('content').innerHTML = '<object type="text/html" data="components/settings/settings.html"></object>';
}
```

Chat Bar
The chat bar facilitates communication and is located on the right side of the screen.
HTML (chatbar.html):
```html
<div class="chatbar">
  <!-- Chat interface goes here -->
</div>
```

CSS (chatbar.css):
```css
.chatbar {
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
}
```

Central Content Area
The central content area displays the selected feature (graph view, documents/files, editor, or settings).
Handling Links in the Graph UI
To handle links clicked within the graph UI and open them in a new browser window or tab, you can use JavaScript.
JavaScript Example:
```javascript
function openResourceInNewWindow(url) {
  window.open(url, '_blank');
}

// Example usage in graphview.js
document.querySelectorAll('.graph-node').forEach(node => {
  node.addEventListener('click', function() {
    const resourceUrl = this.getAttribute('data-resource-url');
    openResourceInNewWindow(resourceUrl);
  });
}
```

Settings Page
The settings page within the main UI and the options page will include the same configuration options to ensure consistency.
HTML (settings.html):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mentus Settings</title>
  <link rel="stylesheet" href="settings.css">
</head>
<body>
  <h1>Mentus Settings</h1>
  <form id="settingsForm">
    <label for="graphDataSource">Graph Data Source:</label>
    <input type="text" id="graphDataSource" name="graphDataSource"><br><br>

    <label for="chatModel">Chat Model:</label>
    <input type="text" id="chatModel" name="chatModel"><br><br>

    <label for="fileSystemSource">File System Source:</label>
    <input type="text" id="fileSystemSource" name="fileSystemSource"><br><br>

    <label for="uiSettings">UI Settings:</label>
    <input type="text" id="uiSettings" name="uiSettings"><br><br>

    <label for="userProfile">User Profile Information:</label>
    <input type="text" id="userProfile" name="userProfile"><br><br>

    <button type="submit">Save Settings</button>
  </form>
  <script src="settings.js"></script>
</body>
</html>
```

JavaScript (settings.js):
```javascript
document.getElementById('settingsForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const settings = {
    graphDataSource: document.getElementById('graphDataSource').value,
    chatModel: document.getElementById('chatModel').value,
    fileSystemSource: document.getElementById('fileSystemSource').value,
    uiSettings: document.getElementById('uiSettings').value,
    userProfile: document.getElementById('userProfile').value
  };
  chrome.storage.sync.set(settings, function() {
    console.log('Settings saved');
  });
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['graphDataSource', 'chatModel', 'fileSystemSource', 'uiSettings', 'userProfile'], function(settings) {
    document.getElementById('graphDataSource').value = settings.graphDataSource || '';
    document.getElementById('chatModel').value = settings.chatModel || '';
    document.getElementById('fileSystemSource').value = settings.fileSystemSource || '';
    document.getElementById('uiSettings').value = settings.uiSettings || '';
    document.getElementById('userProfile').value = settings.userProfile || '';
  });
});
```

Options Page
The options page will have the same configuration options as the settings page.
HTML (options.html):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mentus Options</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <h1>Mentus Options</h1>
  <form id="settingsForm">
    <label for="graphDataSource">Graph Data Source:</label>
    <input type="text" id="graphDataSource" name="graphDataSource"><br><br>

    <label for="chatModel">Chat Model:</label>
    <input type="text" id="chatModel" name="chatModel"><br><br>

    <label for="fileSystemSource">File System Source:</label>
    <input type="text" id="fileSystemSource" name="fileSystemSource"><br><br>

    <label for="uiSettings">UI Settings:</label>
    <input type="text" id="uiSettings" name="uiSettings"><br><br>

    <label for="userProfile">User Profile Information:</label>
    <input type="text" id="userProfile" name="userProfile"><br><br>

    <button type="submit">Save Settings</button>
  </form>
  <script src="options.js"></script>
</body>
</html>
```

JavaScript (options.js):
```javascript
document.getElementById('settingsForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const settings = {
    graphDataSource: document.getElementById('graphDataSource').value,
    chatModel: document.getElementById('chatModel').value,
    fileSystemSource: document.getElementById('fileSystemSource').value,
    uiSettings: document.getElementById('uiSettings').value,
    userProfile: document.getElementById('userProfile').value
  };
  chrome.storage.sync.set(settings, function() {
    console.log('Settings saved');
  });
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['graphDataSource', 'chatModel', 'fileSystemSource', 'uiSettings', 'userProfile'], function(settings) {
    document.getElementById('graphDataSource').value = settings.graphDataSource || '';
    document.getElementById('chatModel').value = settings.chatModel || '';
    document.getElementById('fileSystemSource').value = settings.fileSystemSource || '';
    document.getElementById('uiSettings').value = settings.uiSettings || '';
    document.getElementById('userProfile').value = settings.userProfile || '';
  });
});
```
