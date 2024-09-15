function initializeGoogleAuth() {
  console.log('Initializing Google Auth');
  checkAuthStatus();
}

function checkAuthStatus() {
  console.log('Checking auth status');
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.log('No valid token found, user is not connected');
      updateGoogleAuthUI(false);
    } else {
      console.log('Valid token found, fetching user profile');
      fetchUserProfile(token);
    }
  });
}

function handleGoogleAuth() {
  console.log('handleGoogleAuth called');
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError) {
      console.error('Error getting auth token:', chrome.runtime.lastError);
      updateGoogleAuthUI(false);
    } else {
      console.log('Auth token received, updating UI and fetching user profile');
      updateGoogleAuthUI(true);  // Update UI immediately after successful auth
      fetchUserProfile(token);
    }
  });
}

function handleGoogleDisconnect() {
  console.log('Disconnecting Google account...');
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (chrome.runtime.lastError) {
      console.log('No token found, already disconnected');
      updateGoogleAuthUI(false);
      return;
    }
    // First, revoke the token
    fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to revoke token');
        }
        // Then, remove the cached token
        chrome.identity.removeCachedAuthToken({ token: token }, function() {
          chrome.identity.clearAllCachedAuthTokens(function() {
            console.log('All cached tokens cleared');
            chrome.storage.local.remove(['userInfo'], function() {
              console.log('Google account info removed from storage');
              updateGoogleAuthUI(false);
            });
          });
        });
      })
      .catch(error => {
        console.error('Error revoking token:', error);
        updateGoogleAuthUI(false);
      });
  });
}

function fetchUserProfile(token) {
  console.log('Fetching user profile...');
  fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(response => response.json())
  .then(data => {
    console.log('User profile:', data);
    chrome.storage.local.set({ 'userInfo': data }, function() {
      console.log('User info saved');
      updateGoogleAuthUI(true, data.email);  // Update UI again with email
    });
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
    updateGoogleAuthUI(false);
  });
}

function updateGoogleAuthUI(isConnected, email = '') {
  console.log('Updating Google Auth UI, isConnected:', isConnected, 'email:', email);
  chrome.runtime.sendMessage({
    action: "updateUI",
    isConnected: isConnected,
    email: email
  });
}

// Export functions
window.initializeGoogleAuth = initializeGoogleAuth;
window.handleGoogleAuth = handleGoogleAuth;
window.handleGoogleDisconnect = handleGoogleDisconnect;

console.log('utils/auth.js loaded');