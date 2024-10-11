console.log('User profile script loaded');

function initializeProfileListeners() {
    console.log('Initializing profile listeners');
    
    // Google Auth Buttons
    const googleAuthButton = document.getElementById('google-auth-button');
    const googleDisconnectButton = document.getElementById('google-disconnect-button');
    
    if (googleAuthButton) {
        googleAuthButton.addEventListener('click', window.handleGoogleAuth);
    } else {
        console.warn('Google auth button not found');
    }

    if (googleDisconnectButton) {
        googleDisconnectButton.addEventListener('click', window.handleGoogleDisconnect);
    } else {
        console.warn('Google disconnect button not found');
    }

    // GitHub Auth Buttons
    const githubAuthButton = document.getElementById('github-auth-button');
    const githubDisconnectButton = document.getElementById('github-disconnect-button');

    if (githubAuthButton) {
        githubAuthButton.addEventListener('click', window.handleGitHubAuth);
    } else {
        console.warn('GitHub auth button not found');
    }

    if (githubDisconnectButton) {
        githubDisconnectButton.addEventListener('click', window.handleGitHubLogout);
    } else {
        console.warn('GitHub disconnect button not found');
    }

    // Listen for messages to update auth UI
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "updateGoogleAuthUI") {
            console.log('Received updateGoogleAuthUI message:', request);
            updateGoogleProfileDisplay(request.isConnected, request.email);
        } else if (request.action === "updateGitHubUI") {
            console.log('Received updateGitHubUI message:', request);
            updateGitHubProfileDisplay(request.isConnected);
        }
    });

    // Initial check of auth status
    window.initializeGoogleAuth();
    checkGitHubAuthStatus();
}

function updateGoogleProfileDisplay(isConnected, email = '') {
    console.log('Updating Google profile display:', isConnected, email);
    const googleAccountDisplay = document.getElementById('google-account');
    const googleEmailDisplay = document.getElementById('google-email');
    const googleAuthButton = document.getElementById('google-auth-button');
    const googleDisconnectButton = document.getElementById('google-disconnect-button');

    if (isConnected) {
        if (googleAccountDisplay) googleAccountDisplay.textContent = 'Connected';
        if (googleEmailDisplay) googleEmailDisplay.textContent = email || 'Email not available';
        if (googleAuthButton) googleAuthButton.style.display = 'none';
        if (googleDisconnectButton) googleDisconnectButton.style.display = 'inline-block';
    } else {
        if (googleAccountDisplay) googleAccountDisplay.textContent = 'Not Connected';
        if (googleEmailDisplay) googleEmailDisplay.textContent = 'N/A';
        if (googleAuthButton) googleAuthButton.style.display = 'inline-block';
        if (googleDisconnectButton) googleDisconnectButton.style.display = 'none';
    }
}

async function checkGitHubAuthStatus() {
    const isConnected = await window.isGitHubAuthenticated();
    updateGitHubProfileDisplay(isConnected);
}

function updateGitHubProfileDisplay(isConnected) {
    console.log('Updating GitHub profile display:', isConnected);
    const githubAccountDisplay = document.getElementById('github-account');
    const githubAuthButton = document.getElementById('github-auth-button');
    const githubDisconnectButton = document.getElementById('github-disconnect-button');

    if (isConnected) {
        if (githubAccountDisplay) githubAccountDisplay.textContent = 'Connected';
        if (githubAuthButton) githubAuthButton.style.display = 'none';
        if (githubDisconnectButton) githubDisconnectButton.style.display = 'inline-block';
    } else {
        if (githubAccountDisplay) githubAccountDisplay.textContent = 'Not Connected';
        if (githubAuthButton) githubAuthButton.style.display = 'inline-block';
        if (githubDisconnectButton) githubDisconnectButton.style.display = 'none';
    }
}

// Initialize the profile listeners when the script loads
document.addEventListener('DOMContentLoaded', initializeProfileListeners);