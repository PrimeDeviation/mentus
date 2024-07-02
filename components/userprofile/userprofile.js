document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-profile-form');
    
    if (!form) {
        console.error('User profile form not found');
        return;
    }
    
    // Load existing profile data
    chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'openaiApiKey', 'anthropicApiKey'], function(data) {
        const elements = ['username', 'email', 'bio', 'github-token', 'openai-api-key', 'anthropic-api-key'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = data[id.replace('-', '')] || '';
            } else {
                console.error(`Element with id '${id}' not found`);
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const githubToken = document.getElementById('github-token').value;
        const openaiApiKey = document.getElementById('openai-api-key').value;
        const anthropicApiKey = document.getElementById('anthropic-api-key').value;

        chrome.storage.sync.set({
            username: username,
            email: email,
            bio: bio,
            githubToken: githubToken,
            openaiApiKey: openaiApiKey,
            anthropicApiKey: anthropicApiKey
        }, function() {
            alert('Profile saved successfully!');
        });
    });
});
