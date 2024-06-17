document.addEventListener('DOMContentLoaded', function() {
    // Set a test value for the GitHub repository
    const testGithubRepo = 'https://github.com/test/repo';
    document.getElementById('github-repo').value = testGithubRepo;

    // Save the settings
    document.getElementById('save-settings').click();

    // Load the settings
    loadSettings();

    // Check if the loaded value matches the test value
    const loadedGithubRepo = document.getElementById('github-repo').value;
    if (loadedGithubRepo === testGithubRepo) {
        console.log('Test passed: GitHub repository setting saved and loaded correctly.');
    } else {
        console.log('Test failed: GitHub repository setting not saved or loaded correctly.');
    }
});
