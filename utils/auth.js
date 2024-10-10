console.log('utils/auth.js loaded');

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
  const clientId = 'YOUR_GITHUB_CLIENT_ID'; // Replace with your GitHub Client ID

  try {
    // Step 1: Request Device Code
    const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        scope: 'repo' // Adjust scopes as needed
      })
    });

    const deviceCodeData = await deviceCodeResponse.json();
    console.log('GitHub Device Code Data:', deviceCodeData);

    if (deviceCodeData.error) {
      throw new Error(`GitHub Device Code Error: ${deviceCodeData.error_description}`);
    }

    // Step 2: Prompt User to Authorize
    alert(`To authorize, please visit ${deviceCodeData.verification_uri} and enter code: ${deviceCodeData.user_code}`);

    // Step 3: Poll for Access Token
    const tokenData = await pollForGitHubToken(clientId, deviceCodeData);
    if (tokenData && tokenData.access_token) {
      // Save token and update UI
      await saveGitHubToken(tokenData.access_token);
      updateGitHubAuthUI(true);
    } else {
      console.error('Failed to obtain GitHub access token');
      alert('Failed to obtain GitHub access token. Please try again.');
    }
  } catch (error) {
    console.error('Error in GitHub authentication:', error);
    alert(`GitHub authentication failed: ${error.message}. Please try again.`);
  }
}

async function pollForGitHubToken(clientId, deviceCodeData) {
  const pollInterval = deviceCodeData.interval * 1000;
  const maxTries = Math.ceil(300 / deviceCodeData.interval); // e.g., 5 minutes max
  let tries = 0;

  while (tries < maxTries) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        device_code: deviceCodeData.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      return tokenData;
    } else if (tokenData.error !== 'authorization_pending') {
      console.error('GitHub Token Error:', tokenData);
      break;
    }

    tries++;
  }

  return null;
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