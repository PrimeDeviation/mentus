document.addEventListener('DOMContentLoaded', function () {
    const settingsForm = document.getElementById('settings-form');
    const saveButton = document.getElementById('save-settings');

    // Load saved settings
    loadSettings();

    if (saveButton) {
        saveButton.addEventListener('click', function () {
            saveSettings();
        });
    }

    function saveSettings() {
        const settings = [
            'openai-api-key',
            'anthropic-api-key',
            'graphdb-endpoint',
            'graphdb-creds',
            'local-storage-location'
        ];

        const updatedSettings = {};

        settings.forEach(setting => {
            const inputElement = document.getElementById(setting);
            const currentValue = inputElement.value.trim();

            if (currentValue) {
                updatedSettings[setting] = setting.includes('api-key') ? btoa(currentValue) : currentValue;
            }
        });

        // Save settings to chrome.storage.local
        chrome.storage.local.set(updatedSettings, function () {
            alert('Settings saved successfully.');
            loadSettings(); // Reload settings after saving
        });
    }

    function loadSettings() {
        const settings = [
            'openai-api-key',
            'anthropic-api-key',
            'graphdb-endpoint',
            'graphdb-creds',
            'local-storage-location'
        ];

        chrome.storage.local.get(settings, function (result) {
            settings.forEach(setting => {
                const inputElement = document.getElementById(setting);
                let value = result[setting] || '';

                if (setting.includes('api-key') && value) {
                    value = atob(value);
                    inputElement.value = value;
                    displayObfuscatedKey(setting, value);
                } else {
                    inputElement.value = value;
                }
            });
        });
    }

    function displayObfuscatedKey(elementId, apiKey) {
        const displayElement = document.getElementById(`${elementId}-display`);
        if (apiKey) {
            const obfuscatedKey = 'sk-' + '*'.repeat(apiKey.length - 6) + apiKey.slice(-4);
            displayElement.textContent = obfuscatedKey;
        } else {
            displayElement.textContent = '';
        }
    }

    // Add event listeners to input fields to update obfuscated display for API keys
    ['openai-api-key', 'anthropic-api-key'].forEach(key => {
        document.getElementById(key).addEventListener('input', function() {
            displayObfuscatedKey(key, this.value);
        });
    });
});
