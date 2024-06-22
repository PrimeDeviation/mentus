document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('user-profile-form');
    
    // Load existing profile data
    chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'openaiApiKey', 'anthropicApiKey'], function(data) {
        document.getElementById('username').value = data.username || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('bio').value = data.bio || '';
        document.getElementById('github-token').value = data.githubToken || '';
        document.getElementById('openai-api-key').value = data.openaiApiKey || '';
        document.getElementById('anthropic-api-key').value = data.anthropicApiKey || '';
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
