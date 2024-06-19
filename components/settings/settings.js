document.addEventListener('DOMContentLoaded', function() {
    const settingsForm = document.getElementById('settings-form');
    const saveButton = document.getElementById('save-settings');

    // Load saved settings
    loadSettings();

    saveButton.addEventListener('click', function() {
        saveSettings();
    });

    function saveSettings() {
        const openaiApiKey = document.getElementById('openai-api-key').value.trim();
        const anthropicApiKey = document.getElementById('anthropic-api-key').value.trim();
        const graphdbEndpoint = document.getElementById('graphdb-endpoint').value.trim();
        const graphdbCreds = document.getElementById('graphdb-creds').value.trim();
        const localStorageLocation = document.getElementById('local-storage-location').value.trim();
        const graphSource = document.getElementById('graph-source').value.trim();
        const graphType = document.getElementById('graph-type').value.trim();
        const obsidianVaultPath = document.getElementById('obsidian-vault-path').value.trim();
        const githubRepo = document.getElementById('github-repo').value.trim();

        // Validate input values
        if (!openaiApiKey || !anthropicApiKey || !graphdbEndpoint || !graphdbCreds || !localStorageLocation || !cloudStorageEndpoint || !cloudStorageCreds || !graphSource || !graphType || !editorSettings || !codeRepoIntegration || !obsidianVaultPath) {
            alert('Please fill in all fields.');
            return;
        }

        // Save settings to local storage
        localStorage.setItem('openaiApiKey', openaiApiKey);
        localStorage.setItem('anthropicApiKey', anthropicApiKey);
        localStorage.setItem('graphdbEndpoint', graphdbEndpoint);
        localStorage.setItem('graphdbCreds', graphdbCreds);
        localStorage.setItem('localStorageLocation', localStorageLocation);
        localStorage.setItem('graphSource', graphSource);
        localStorage.setItem('graphType', graphType);
        localStorage.setItem('obsidianVaultPath', obsidianVaultPath);
        localStorage.setItem('githubRepo', githubRepo);
        alert('Settings saved successfully.');
    }

function loadSettings() {
    document.getElementById('openai-api-key').value = localStorage.getItem('openaiApiKey') || '';
    document.getElementById('anthropic-api-key').value = localStorage.getItem('anthropicApiKey') || '';
    document.getElementById('graphdb-endpoint').value = localStorage.getItem('graphdbEndpoint') || '';
    document.getElementById('graphdb-creds').value = localStorage.getItem('graphdbCreds') || '';
    document.getElementById('local-storage-location').value = localStorage.getItem('localStorageLocation') || '';
    document.getElementById('graph-source').value = localStorage.getItem('graphSource') || '';
    document.getElementById('graph-type').value = localStorage.getItem('graphType') || '';
    document.getElementById('obsidian-vault-path').value = localStorage.getItem('obsidianVaultPath') || '';
    document.getElementById('github-repo').value = localStorage.getItem('githubRepo') || '';

    document.getElementById('openai-api-key-value').textContent = obfuscate(localStorage.getItem('openaiApiKey')) || '';
    document.getElementById('anthropic-api-key-value').textContent = obfuscate(localStorage.getItem('anthropicApiKey')) || '';
    document.getElementById('local-storage-location-value').textContent = localStorage.getItem('localStorageLocation') || '';
    document.getElementById('graph-source-value').textContent = localStorage.getItem('graphSource') || '';
    document.getElementById('github-repo-value').textContent = localStorage.getItem('githubRepo') || '';
}

function obfuscate(apiKey) {
    if (!apiKey) return '';
    return apiKey.replace(/.(?=.{4})/g, '*');
}
