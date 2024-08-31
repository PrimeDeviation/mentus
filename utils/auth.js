function initializeGoogleAuth() {
  document.getElementById('google-auth-button').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "authenticate"}, function(response) {
      if (response.success) {
        console.log('Authentication successful');
        // Update UI to show authenticated state
        document.getElementById('google-account-display').textContent = 'Authenticated';
      } else {
        console.error('Authentication failed:', response.error);
        // Update UI to show error
        document.getElementById('google-account-display').textContent = 'Authentication failed';
      }
    });
  });
}

function fetchUserProfile(token) {
  fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('User profile:', data);
    document.getElementById('google-account-display').textContent = data.email;
    chrome.storage.local.set({ 'userInfo': data }, function() {
      console.log('User info saved');
    });
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
    document.getElementById('google-account-display').textContent = 'Failed to fetch user profile';
  });
}

// Initialize Google Auth when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGoogleAuth);