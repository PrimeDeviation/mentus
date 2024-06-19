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
        loadChatModels(); // Call loadChatModels after saving settings
        loadChatModels(); // Call loadChatModels after saving settings
        loadChatModels(); // Call loadChatModels after saving settings
        loadChatModels(); // Call loadChatModels after saving settings
        loadChatModels(); // Call loadChatModels after saving settings
    }

    function loadChatModels() {
        const openaiApiKey = localStorage.getItem('openaiApiKey');
        const anthropicApiKey = localStorage.getItem('anthropicApiKey');
        const chatModelsDropdown = document.getElementById('chat-models');

        // Clear existing options
        chatModelsDropdown.innerHTML = '';

        if (openaiApiKey) {
            const openaiGroup = document.createElement('optgroup');
            openaiGroup.label = 'GPT Models';
            const openaiModels = ['gpt-4o']; // Representative model
            openaiModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                openaiGroup.appendChild(option);
            });
            chatModelsDropdown.appendChild(openaiGroup);
        }

        if (anthropicApiKey) {
            const anthropicGroup = document.createElement('optgroup');
            anthropicGroup.label = 'Anthropic Models';
            const anthropicModels = ['claude-3-opus-20240229']; // Representative model
            anthropicModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                anthropicGroup.appendChild(option);
            });
            chatModelsDropdown.appendChild(anthropicGroup);
        }

        if (!openaiApiKey && !anthropicApiKey) {
            const noModelsOption = document.createElement('option');
            noModelsOption.value = '';
            noModelsOption.textContent = 'No validated models';
            noModelsOption.disabled = true;
            chatModelsDropdown.appendChild(noModelsOption);
        }

        // Add event listener to update the selected model with "(active)"
        chatModelsDropdown.addEventListener('change', function() {
            const selectedOption = chatModelsDropdown.options[chatModelsDropdown.selectedIndex];
            if (selectedOption.value) {
                selectedOption.textContent = `${selectedOption.value} (active)`;
            }
        });
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
