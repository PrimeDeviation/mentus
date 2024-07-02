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
            document.getElementById('google-account').value = data.email;
            chrome.storage.sync.set({ googleAccount: data.email });
            console.log('Google account set:', data.email);
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
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
