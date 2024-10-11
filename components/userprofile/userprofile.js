console.log('User profile script loaded');

function initializeProfileListeners() {
    console.log('Initializing profile listeners');
    
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

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "updateGoogleAuthUI") {
            console.log('Received updateGoogleAuthUI message:', request);
            updateProfileDisplay(request.isConnected, request.email);
        }
    });

    // Initial check of auth status
    window.initializeGoogleAuth();
}

function updateProfileDisplay(isConnected, email = '') {
    console.log('Updating profile display:', isConnected, email);
    const googleAccountDisplay = document.getElementById('google-account');
    const googleEmailDisplay = document.getElementById('google-email');
    const googleAuthButton = document.getElementById('google-auth-button');
    const googleDisconnectButton = document.getElementById('google-disconnect-button');

    if (isConnected) {
        if (googleAccountDisplay) googleAccountDisplay.textContent = 'Connected';
        if (googleEmailDisplay) googleEmailDisplay.textContent = email;
        if (googleAuthButton) googleAuthButton.style.display = 'none';
        if (googleDisconnectButton) googleDisconnectButton.style.display = 'block';
    } else {
        if (googleAccountDisplay) googleAccountDisplay.textContent = 'Not Connected';
        if (googleEmailDisplay) googleEmailDisplay.textContent = 'N/A';
        if (googleAuthButton) googleAuthButton.style.display = 'block';
        if (googleDisconnectButton) googleDisconnectButton.style.display = 'none';
    }
}

// Initialize the profile listeners when the script loads
document.addEventListener('DOMContentLoaded', initializeProfileListeners);
