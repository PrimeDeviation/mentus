document.addEventListener('DOMContentLoaded', function () {
    const settings = [
        'openai-api-key',
        'anthropic-api-key',
        'graphdb-endpoint',
        'graphdb-creds',
        'local-storage-location'
    ];

    // Load saved settings
    loadSettings();

    // Add event listeners for input changes
    settings.forEach(setting => {
        const inputElement = document.getElementById(setting);
        if (inputElement) {
            inputElement.addEventListener('input', debounce(function() {
                saveSetting(setting, this.value);
            }, 500));
        } else {
            console.error(`Element not found for setting: ${setting}`);
        }
    });

    function saveSetting(setting, value) {
        const updatedSetting = {};
        if (setting.includes('api-key')) {
            updatedSetting[setting] = btoa(value.trim()); // Encode API keys
        } else {
            updatedSetting[setting] = value.trim();
        }

        // Save setting to chrome.storage.local
        chrome.storage.local.set(updatedSetting, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving setting:', chrome.runtime.lastError);
            } else {
                console.log(`${setting} saved successfully`);
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
                            value = atob(value); // Decode API keys
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

    // Debounce function to limit how often a function can fire
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
