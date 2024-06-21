document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('save-settings');
    const settings = [
        'openai-api-key',
        'anthropic-api-key',
        'graphdb-endpoint',
        'graphdb-creds',
        'local-storage-location'
    ];

    // Load saved settings
    loadSettings();

    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }

    // Add event listeners for Enter key on input fields
    settings.forEach(setting => {
        const inputElement = document.getElementById(setting);
        if (inputElement) {
            inputElement.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    saveSettings();
                }
            });
        } else {
            console.error(`Element not found for setting: ${setting}`);
        }
    });

    function saveSettings() {
        const updatedSettings = {};
        let hasChanges = false;

        settings.forEach(setting => {
            const inputElement = document.getElementById(setting);
            if (inputElement) {
                const currentValue = inputElement.value.trim();
                const storedValue = localStorage.getItem(setting);

                if (currentValue !== storedValue) {
                    hasChanges = true;
                    if (setting.includes('api-key')) {
                        updatedSettings[setting] = btoa(currentValue); // Encode API keys
                    } else {
                        updatedSettings[setting] = currentValue;
                    }
                    localStorage.setItem(setting, currentValue);
                }
                console.log(`Saving ${setting}:`, updatedSettings[setting]); // Debug log
            } else {
                console.error(`Element not found for setting: ${setting}`);
            }
        });

        if (!hasChanges) {
            console.log('No changes detected, skipping save');
            return;
        }

        // Save settings to chrome.storage.local
        chrome.storage.local.set(updatedSettings, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
            } else {
                console.log('Settings saved successfully');
                loadSettings(); // Reload settings after saving
            }
        });
    }

    function loadSettings() {
        chrome.storage.local.get(settings, function (result) {
            console.log('Loaded settings:', result); // Debug log
            settings.forEach(setting => {
                const inputElement = document.getElementById(setting);
                const displayElement = document.getElementById(`${setting}-display`);
                if (inputElement && displayElement) {
                    let value = result[setting] || '';
            
                    if (setting.includes('api-key') && value) {
                        try {
                            // Check if the value is base64 encoded
                            if (/^[A-Za-z0-9+/=]+$/.test(value)) {
                                value = atob(value); // Decode API keys
                            }
                            inputElement.value = ''; // Clear the input field for security
                            const visiblePart = value.substring(0, 8);
                            const obfuscatedPart = '*'.repeat(Math.max(0, value.length - 8));
                            displayElement.textContent = visiblePart + obfuscatedPart;
                        } catch (e) {
                            console.error('Error processing API key:', e);
                            displayElement.textContent = 'Error: Invalid API key format';
                        }
                    } else {
                        inputElement.value = value;
                        displayElement.textContent = value || 'No value set';
                    }
                    console.log(`Loaded ${setting}:`, displayElement.textContent); // Debug log
                } else {
                    console.error(`Element not found for setting: ${setting}`);
                }
            });
        });
    }
});
