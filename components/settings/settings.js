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
                if (setting.includes('api-key')) {
                    updatedSettings[setting] = btoa(currentValue); // Encode API keys
                } else {
                    updatedSettings[setting] = currentValue;
                }
            }
            console.log(`Saving ${setting}:`, updatedSettings[setting]); // Debug log
        });

        // Save settings to chrome.storage.local
        chrome.storage.local.set(updatedSettings, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                alert('Error saving settings: ' + chrome.runtime.lastError.message);
            } else {
                console.log('Settings saved successfully');
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
            console.log('Loaded settings:', result); // Debug log
            settings.forEach(setting => {
                const inputElement = document.getElementById(setting);
                const displayElement = document.getElementById(`${setting}-display`);
                let value = result[setting] || '';
        
                if (setting.includes('api-key') && value) {
                    try {
                        value = atob(value); // Decode API keys
                        inputElement.value = ''; // Clear the input field for security
                        if (displayElement) {
                            displayElement.textContent = value ? '********' : '';
                        }
                    } catch (e) {
                        console.error('Error decoding API key:', e);
                        value = '';
                    }
                } else {
                    inputElement.value = value;
                    if (displayElement) {
                        displayElement.textContent = value;
                    }
                }
                console.log(`Loaded ${setting}:`, displayElement ? displayElement.textContent : value); // Debug log
            });
        });
    }
});
