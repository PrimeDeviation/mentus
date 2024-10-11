console.log('utils/auth.js loaded');

/** Constants **/
const GITHUB_CLIENT_ID = 'Ov23liHRV3Oj4MASdWjh'; // Your GitHub Client ID

/** Google Authentication **/

function initializeGoogleAuth() {
  console.log('Initializing Google Auth');
  checkGoogleAuthStatus();
}

function checkGoogleAuthStatus() {
  console.log('Checking Google auth status');
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.log('No valid Google token found, user is not connected');
      updateGoogleAuthUI(false);
    } else {
      console.log('Valid Google token found, fetching user profile');
      fetchGoogleUserProfile(token);
    }
  });
}

function handleGoogleAuth() {
  console.log('handleGoogleAuth called');
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError) {
      console.error('Error getting Google auth token:', chrome.runtime.lastError);
      updateGoogleAuthUI(false);
    } else {
      console.log('Google auth token received, updating UI and fetching user profile');
      updateGoogleAuthUI(true);  // Update UI immediately after successful auth
      fetchGoogleUserProfile(token);
    }
  });
}

function handleGoogleDisconnect() {
  console.log('Disconnecting Google account...');
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (chrome.runtime.lastError) {
      console.log('No Google token found, already disconnected');
      updateGoogleAuthUI(false);
      return;
    }
    // Revoke the token
    fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to revoke Google token');
        }
        // Remove the cached token
        chrome.identity.removeCachedAuthToken({ token: token }, function() {
          console.log('Google token removed from cache');
          chrome.storage.local.remove(['userInfo'], function() {
            console.log('Google account info removed from storage');
            updateGoogleAuthUI(false);
          });
        });
      })
      .catch(error => {
        console.error('Error revoking Google token:', error);
        updateGoogleAuthUI(false);
      });
  });
}

function fetchGoogleUserProfile(token) {
  console.log('Fetching Google user profile...');
  fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Google user profile:', data);
    chrome.storage.local.set({ 'userInfo': data }, function() {
      console.log('Google user info saved');
      updateGoogleAuthUI(true, data.email);  // Update UI with email
    });
  })
  .catch(error => {
    console.error('Error fetching Google user profile:', error);
    updateGoogleAuthUI(false);
  });
}

function updateGoogleAuthUI(isConnected, email = '') {
  console.log('Updating Google Auth UI, isConnected:', isConnected, 'email:', email);
  chrome.runtime.sendMessage({
    action: "updateGoogleAuthUI",
    isConnected: isConnected,
    email: email
  });
}

/** GitHub Authentication **/

async function handleGitHubAuth() {
  console.log('Starting GitHub authentication');
  const clientId = GITHUB_CLIENT_ID;
  const redirectUri = chrome.identity.getRedirectURL();

  const authUrl = `https://github.com/login/oauth/authorize` +
                  `?client_id=${clientId}` +
                  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                  `&scope=repo`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true
    },
    async function(responseUrl) {
      if (chrome.runtime.lastError) {
        console.error('Error during GitHub authentication:', chrome.runtime.lastError);
        alert('GitHub authentication failed. Please try again.');
        return;
      }

      // Extract the code from responseUrl
      const urlParams = new URLSearchParams(new URL(responseUrl).search);
      const code = urlParams.get('code');

      if (code) {
        // Exchange code for access token
        const tokenData = await exchangeCodeForToken(clientId, code);
        if (tokenData && tokenData.access_token) {
          await saveGitHubToken(tokenData.access_token);
          updateGitHubAuthUI(true);
        } else {
          console.error('Failed to obtain GitHub access token', tokenData);
          alert('Failed to obtain GitHub access token. Please try again.');
        }
      } else {
        console.error('No code found in response URL');
        alert('GitHub authentication failed. Please try again.');
      }
    }
  );
}

async function exchangeCodeForToken(clientId, code) {
  const backendUrl = `https://your-backend.com/github/oauth?code=${encodeURIComponent(code)}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Error fetching GitHub access token from backend:', error);
    return null;
  }
}

async function saveGitHubToken(token) {
  await chrome.storage.local.set({ githubToken: token });
}

async function isGitHubAuthenticated() {
  const result = await chrome.storage.local.get('githubToken');
  return !!result.githubToken;
}

async function getGitHubToken() {
  const result = await chrome.storage.local.get('githubToken');
  return result.githubToken || null;
}

async function handleGitHubLogout() {
  console.log('Disconnecting GitHub account...');
  await chrome.storage.local.remove('githubToken');
  updateGitHubAuthUI(false);
}

function updateGitHubAuthUI(isConnected) {
  console.log('Updating GitHub Auth UI, isConnected:', isConnected);
  chrome.runtime.sendMessage({
    action: "updateGitHubUI",
    isConnected: isConnected
  });
}

// Expose functions to global scope
window.initializeGoogleAuth = initializeGoogleAuth;
window.handleGoogleAuth = handleGoogleAuth;
window.handleGoogleDisconnect = handleGoogleDisconnect;
window.isGitHubAuthenticated = isGitHubAuthenticated;
window.getGitHubToken = getGitHubToken;
window.handleGitHubAuth = handleGitHubAuth;
window.handleGitHubLogout = handleGitHubLogout;