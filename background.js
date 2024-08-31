chrome.runtime.onInstalled.addListener(function() {
    console.log('Background script loaded');
    initializeAuth();
});

function initializeAuth() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            console.log('Auth token request initiated');
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
            } else {
                console.log('Auth token received:', token ? 'Token present' : 'No token');
                handleAuthToken(token);
                resolve(token);
            }
        });
    });
}

function handleAuthToken(token) {
    if (token) {
        console.log('Successfully authenticated');
        chrome.storage.local.set({ 'authToken': token }, function() {
            console.log('Auth token saved');
        });
        getUserInfo(token);
    } else {
        console.error('No auth token received');
    }
}

function getUserInfo(token) {
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log('User info:', data);
        chrome.storage.local.set({ 'userInfo': data }, function() {
            console.log('User info saved');
        });
    })
    .catch(error => {
        console.error('Error fetching user info:', error);
    });
}

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("components/mentus_tab.html") });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'initializeAuth') {
        initializeAuth()
            .then(token => sendResponse({ success: true, token: token }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    } else if (request.action === 'saveFile') {
        const { filePath, content } = request;
        chrome.storage.local.set({ [filePath]: content }, function() {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true });
            }
        });
        return true;
    } else if (request.action === 'openDirectoryPicker') {
        // This functionality is not available in extensions
    } else if (request.action === 'configureGitHubIntegration') {
        configureGitHubIntegration(request.repoUrl, request.branch, request.token)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    } else if (request.action === "authenticate") {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true, token: token });
            }
        });
        return true; // Indicates that the response is sent asynchronously
    }
});

async function configureGitHubIntegration(repoUrl, branch, token) {
    try {
        const { Octokit } = await import('https://cdn.skypack.dev/@octokit/rest');
        const octokit = new Octokit({ auth: token });

        const [owner, repo] = repoUrl.split('/').slice(-2);
        const response = await octokit.repos.get({ owner, repo });

        console.log('Repository connection successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error connecting to repository:', error);
        throw error;
    }
}
