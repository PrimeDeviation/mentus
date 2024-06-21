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
            const displayElement = document.getElementById(`${setting}-display`);
            const currentValue = inputElement.value.trim();
            const displayedValue = displayElement ? displayElement.textContent : '';

            // Only update if the value has changed and is not the obfuscated version
            if (currentValue && currentValue !== displayedValue && !isObfuscated(currentValue)) {
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
                const displayElement = document.getElementById(`${setting}-display`);
                let value = result[setting] || '';

                if (setting.includes('api-key') && value) {
                    value = atob(value);
                    displayObfuscatedKey(setting, value);
                } else if (displayElement) {
                    displayElement.textContent = value;
                }

                inputElement.value = '';
            });
        });
    }

    function displayObfuscatedKey(elementId, apiKey) {
        const displayElement = document.getElementById(`${elementId}-display`);
        if (apiKey) {
            const obfuscatedKey = '*'.repeat(apiKey.length - 4) + apiKey.slice(-4);
            displayElement.textContent = obfuscatedKey;
        } else {
            displayElement.textContent = '';
        }
    }

    function isObfuscated(value) {
        return /^\*+.{4}$/.test(value);
    }

    // Add event listeners to input fields to update obfuscated display for API keys
    ['openai-api-key', 'anthropic-api-key'].forEach(key => {
        document.getElementById(key).addEventListener('input', function() {
            displayObfuscatedKey(key, this.value);
        });
    });
});
