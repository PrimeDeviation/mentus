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
