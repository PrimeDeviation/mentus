// ... (previous content remains unchanged)

let profileDataReady = false;

// Add this function at the top of your script
function normalizeEndpoint(endpoint) {
    return endpoint.replace(/\/+$/, '');
}

// Onboarding steps definition using Intro.js
function initializeOnboarding() {
  console.log('Starting interactive onboarding with Intro.js');

  // Initialize the steps array
  const steps = [];

  // ... (rest of the file content)
