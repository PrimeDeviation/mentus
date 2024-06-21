document.addEventListener('DOMContentLoaded', function () {
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
                updatedSettings[setting] = currentValue;
            }
        });

        // Save settings to chrome.storage.local
        chrome.storage.local.set(updatedSettings, function () {
            if (chrome.runtime.lastError) {
                alert('Error saving settings: ' + chrome.runtime.lastError.message);
            } else {
                alert('Settings saved successfully.');
                loadSettings(); // Reload settings after saving
            }
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
                const value = result[setting] || '';
                inputElement.value = value;
            });
        });
    }
});
