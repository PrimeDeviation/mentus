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
        if (!openaiApiKey || !anthropicApiKey || !graphdbEndpoint || !graphdbCreds || !localStorageLocation || !graphSource || !graphType || !obsidianVaultPath) {
            alert('Please fill in all fields.');
            return;
        }

        // Save settings to local storage
        saveToLocalFile('openaiApiKey', openaiApiKey);
        saveToLocalFile('anthropicApiKey', anthropicApiKey);
        saveToLocalFile('graphdbEndpoint', graphdbEndpoint);
        saveToLocalFile('graphdbCreds', graphdbCreds);
        saveToLocalFile('localStorageLocation', localStorageLocation);
        saveToLocalFile('graphSource', graphSource);
        saveToLocalFile('graphType', graphType);
        saveToLocalFile('obsidianVaultPath', obsidianVaultPath);
        saveToLocalFile('githubRepo', githubRepo);
        alert('Settings saved successfully.');
    }

function loadSettings() {
    document.getElementById('openai-api-key').value = loadFromLocalFile('openaiApiKey') || '';
    document.getElementById('anthropic-api-key').value = loadFromLocalFile('anthropicApiKey') || '';
    document.getElementById('graphdb-endpoint').value = loadFromLocalFile('graphdbEndpoint') || '';
    document.getElementById('graphdb-creds').value = loadFromLocalFile('graphdbCreds') || '';
    document.getElementById('local-storage-location').value = loadFromLocalFile('localStorageLocation') || '';
    document.getElementById('graph-source').value = loadFromLocalFile('graphSource') || '';
    document.getElementById('graph-type').value = loadFromLocalFile('graphType') || '';
    document.getElementById('obsidian-vault-path').value = loadFromLocalFile('obsidianVaultPath') || '';
    document.getElementById('github-repo').value = loadFromLocalFile('githubRepo') || '';

    document.getElementById('openai-api-key-value').textContent = obfuscate(loadFromLocalFile('openaiApiKey')) || '';
    document.getElementById('anthropic-api-key-value').textContent = obfuscate(loadFromLocalFile('anthropicApiKey')) || '';
    document.getElementById('local-storage-location-value').textContent = loadFromLocalFile('localStorageLocation') || '';
    document.getElementById('graph-source-value').textContent = loadFromLocalFile('graphSource') || '';
    document.getElementById('github-repo-value').textContent = loadFromLocalFile('githubRepo') || '';
}

function obfuscate(apiKey) {
    if (!apiKey) return '';
    return apiKey.replace(/.(?=.{4})/g, '*');
}

function saveToLocalFile(key, value) {
    const fs = require('fs');
    const path = `./settings/${key}.txt`;
    fs.writeFileSync(path, value, 'utf8');
}

function loadFromLocalFile(key) {
    const fs = require('fs');
    const path = `./settings/${key}.txt`;
    if (fs.existsSync(path)) {
        return fs.readFileSync(path, 'utf8');
    }
    return null;
}
