chrome.runtime.onInstalled.addListener(function() {
    console.log('Background script loaded');
});

// Function to configure GitHub repository integration
function configureGitHubIntegration(repoUrl, branch, token) {
    // Load the Octokit library
    const Octokit = require('../../libs/octokit.js');

    // Initialize Octokit with the provided token
    const octokit = new Octokit({
        auth: token
    });

    // Test the connection to the repository
    octokit.repos.get({
        owner: repoUrl.split('/')[3],
        repo: repoUrl.split('/')[4]
    }).then(response => {
        console.log('Repository connection successful:', response.data);
    }).catch(error => {
        console.error('Error connecting to repository:', error);
    });
}
