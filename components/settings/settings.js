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
            if (currentValue && currentValue !== displayedValue) {
                updatedSettings[setting] = currentValue;
            }
        });

        // Save settings to chrome.storage.local
        try {
            chrome.storage.local.set(updatedSettings, function () {
                alert('Settings saved successfully.');
                loadSettings(); // Reload settings after saving
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('An error occurred while saving settings. Please check the console for more details.');
        }
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
                const value = result[setting] || '';

                inputElement.value = value;

                if (setting.includes('api-key')) {
                    displayObfuscatedKey(setting, value);
                } else if (displayElement) {
                    displayElement.textContent = value;
                }
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

    // Add event listeners to input fields to update obfuscated display for API keys
    ['openai-api-key', 'anthropic-api-key'].forEach(key => {
        document.getElementById(key).addEventListener('input', function() {
            displayObfuscatedKey(key, this.value);
        });
    });
});
