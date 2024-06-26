chrome.runtime.onInstalled.addListener(function() {
    console.log('Background script loaded');
    initializeAuth();
});

function initializeAuth() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
        } else {
            console.log('Successfully authenticated');
            // You can store the token or perform any other initialization here
        }
    });
}
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("components/mentus_tab.html") });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveFile') {
        const { filePath, content } = request;
        chrome.storage.local.set({ [filePath]: content }, function() {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true });
            }
        });
        return true; // Indicates that the response is sent asynchronously
    } else if (request.action === 'openDirectoryPicker') {
        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else if (entry) {
                chrome.fileSystem.getDisplayPath(entry, function(path) {
                    sendResponse({ path: path });
                });
            } else {
                sendResponse({ error: 'No directory selected' });
            }
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Function to configure GitHub repository integration
function configureGitHubIntegration(repoUrl, branch, token) {
    // Load the Octokit library
    const Octokit = require('../../libs/octokit.js');

    // Initialize Octokit with the provided token
    const octokit = new Octokit({
        auth: token
    });

    // Test the connection to the repository
    octokit.repos.get({
        owner: repoUrl.split('/')[3],
        repo: repoUrl.split('/')[4]
    }).then(response => {
        console.log('Repository connection successful:', response.data);
    }).catch(error => {
        console.error('Error connecting to repository:', error);
    });
}
