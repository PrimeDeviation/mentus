document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-profile-form');
    const googleAuthButton = document.getElementById('google-auth-button');
    
    if (!form) {
        console.error('User profile form not found');
        return;
    }
    
    // Load existing profile data
    loadProfileData();

    // Ensure all elements are present
    const requiredElements = ['username', 'email', 'bio', 'google-account', 'google-auth-button'];
    let allElementsPresent = true;
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Required element with id '${id}' not found`);
            allElementsPresent = false;
        }
    });

    if (!allElementsPresent) {
        console.error('Not all required elements are present. Some functionality may be limited.');
        return;
    }

    // Add event listeners
    if (googleAuthButton) {
        googleAuthButton.addEventListener('click', handleGoogleAuth);
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    function loadProfileData() {
        chrome.storage.sync.get(['username', 'email', 'bio', 'googleAccount'], function(data) {
            const elements = ['username', 'email', 'bio', 'google-account'];
            elements.forEach(id => {
                const inputElement = document.getElementById(id);
                const displayElement = document.getElementById(`${id}-display`);
                if (inputElement && displayElement) {
                    const value = data[id.replace('-', '')] || '';
                    inputElement.value = value;
                    displayElement.textContent = value || 'No value set';
                } else {
                    console.error(`Element with id '${id}' not found`);
                }
            });
        });
    }

    function handleGoogleAuth() {
        console.log('Initiating Google Auth...');
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            console.log('Auth token request initiated');
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError.message);
            } else {
                console.log('Auth token received:', token ? 'Token present' : 'No token');
                if (token) {
                    fetchUserInfo(token);
                } else {
                    console.error('No auth token received');
                }
            }
        });
    }

    function fetchUserInfo(token) {
        console.log('Fetching user info...');
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log('User info retrieved:', data);
            const googleAccountInput = document.getElementById('google-account');
            const googleAccountDisplay = document.getElementById('google-account-display');
            googleAccountInput.value = data.email;
            googleAccountDisplay.textContent = data.email;
            chrome.storage.sync.set({ googleAccount: data.email });
            console.log('Google account set:', data.email);
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const googleAccount = document.getElementById('google-account').value;

        chrome.storage.sync.set({
            username: username,
            email: email,
            bio: bio,
            googleAccount: googleAccount
        }, function() {
            alert('Profile saved successfully!');
            loadProfileData(); // Reload profile data after saving
        });
    }
});
