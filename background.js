chrome.runtime.onInstalled.addListener(function() {
    console.log('Background script loaded');
    initializeAuth();
});

function initializeAuth() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError.message);
            // Attempt to clear the token and try again
            chrome.identity.removeCachedAuthToken({ token: token }, function() {
                chrome.identity.getAuthToken({ interactive: true }, handleAuthToken);
            });
        } else {
            handleAuthToken(token);
        }
    });
}

function handleAuthToken(token) {
    if (token) {
        console.log('Successfully authenticated');
        chrome.storage.local.set({ 'authToken': token }, function() {
            console.log('Auth token saved');
        });
        // Verify the token with Google's tokeninfo endpoint
        fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Token validation error:', data.error);
                    chrome.identity.removeCachedAuthToken({ token: token }, initializeAuth);
                } else {
                    console.log('Token validated successfully');
                }
            })
            .catch(error => {
                console.error('Error validating token:', error);
            });
    } else {
        console.error('No auth token received');
    }
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
        return true;
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
        return true;
    } else if (request.action === 'configureGitHubIntegration') {
        configureGitHubIntegration(request.repoUrl, request.branch, request.token)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
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
