document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-profile-form');
    const googleAuthButton = document.getElementById('google-auth-button');
    
    if (!form) {
        console.error('User profile form not found');
        return;
    }
    
    // Load existing profile data
    chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'googleAccount'], function(data) {
        const elements = ['username', 'email', 'bio', 'github-token', 'google-account'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = data[id.replace('-', '')] || '';
            } else {
                console.error(`Element with id '${id}' not found`);
            }
        });
    });

    // Ensure all elements are present
    const requiredElements = ['username', 'email', 'bio', 'github-token', 'google-account', 'google-auth-button'];
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

    // Define handleGoogleAuth function
    function handleGoogleAuth() {
        console.log('Initiating Google Auth...');
        chrome.runtime.sendMessage({action: 'initializeAuth'}, function(response) {
            console.log('Auth response received:', response);
            if (response.success) {
                chrome.storage.local.get(['userInfo'], function(result) {
                    console.log('User info retrieved:', result.userInfo);
                    if (result.userInfo) {
                        document.getElementById('google-account').value = result.userInfo.email;
                        chrome.storage.sync.set({ googleAccount: result.userInfo.email });
                        console.log('Google account set:', result.userInfo.email);
                    }
                });
            } else {
                console.error('Error during authentication:', response.error);
            }
        });
    }

    // Define handleFormSubmit function
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const githubToken = document.getElementById('github-token').value;
        const googleAccount = document.getElementById('google-account').value;

        chrome.storage.sync.set({
            username: username,
            email: email,
            bio: bio,
            githubToken: githubToken,
            googleAccount: googleAccount
        }, function() {
            alert('Profile saved successfully!');
        });
    }

    // Only add event listeners if all elements are present
    if (googleAuthButton) {
        googleAuthButton.addEventListener('click', handleGoogleAuth);
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    googleAuthButton.addEventListener('click', function() {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            
            fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('google-account').value = data.email;
                chrome.storage.sync.set({ googleAccount: data.email });
            })
            .catch(error => console.error('Error fetching Google user info:', error));
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const githubToken = document.getElementById('github-token').value;
        const googleAccount = document.getElementById('google-account').value;

        chrome.storage.sync.set({
            username: username,
            email: email,
            bio: bio,
            githubToken: githubToken,
            googleAccount: googleAccount
        }, function() {
            alert('Profile saved successfully!');
        });
    });
});
