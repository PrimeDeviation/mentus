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

let userInfo = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authenticate") {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                fetchUserInfo(token, sendResponse);
            }
        });
        return true; // Indicates that the response is sent asynchronously
    } else if (request.action === "disconnect") {
        handleDisconnect(sendResponse);
        return true;
    } else if (request.action === "updateUI") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "updateGoogleAuthUI",
                isConnected: request.isConnected,
                email: request.email
            });
        });
    }
});

function fetchUserInfo(token, sendResponse) {
    fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        chrome.storage.local.set({ 'userInfo': data }, function() {
            sendResponse({ success: true, userInfo: data });
        });
    })
    .catch(error => {
        console.error('Error fetching user info:', error);
        sendResponse({ success: false, error: error.message });
    });
}

function handleDisconnect(sendResponse) {
    chrome.identity.getAuthToken({ interactive: false }, function(token) {
        if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
            chrome.identity.removeCachedAuthToken({ token: token }, function() {
                chrome.storage.local.remove(['userInfo'], function() {
                    sendResponse({ success: true });
                });
            });
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.contentScriptQuery == "fetchObsidianFile") {
        fetch(request.url, {
            headers: {
                'Authorization': `Bearer ${request.apiKey}`,
                'Accept': 'application/json'
            }
        })
        .then(response => response.text())
        .then(text => {
            sendResponse({success: true, data: text});
        })
        .catch(error => {
            console.error('Error fetching from Obsidian API:', error);
            sendResponse({success: false, error: error.toString()});
        });
        return true;  // Will respond asynchronously
    }
});