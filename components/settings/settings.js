document.addEventListener('DOMContentLoaded', async function () {
    const settingsForm = document.getElementById('settings-form');
    const saveButton = document.getElementById('save-settings');

    const settings = [
        'openai-api-key',
        'anthropic-api-key',
        'graphdb-endpoint',
        'graphdb-creds',
        'local-storage-location'
    ];

    // Load saved settings
    await loadSettings();

    // Add event listeners for input changes
    settings.forEach(setting => {
        const inputElement = document.getElementById(setting);
        if (inputElement) {
            inputElement.addEventListener('input', debounce(async function() {
                await saveSetting(setting, this.value);
            }, 500));
        } else {
            console.error(`Element not found for setting: ${setting}`);
        }
    });

    if (saveButton) {
        saveButton.addEventListener('click', function () {
            saveSettings();
        });
    }

    function isBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (err) {
            return false;
        }
    }

    async function saveSettings() {
        const updatedSettings = {};

        for (const setting of settings) {
            const inputElement = document.getElementById(setting);
            const currentValue = inputElement.value.trim();

            if (currentValue) {
                if (setting.includes('api-key')) {
                    // Encrypt API keys before storing
                    updatedSettings[setting] = await encryptString(currentValue);
                } else {
                    updatedSettings[setting] = currentValue;
                }
            }
        }

        // Save settings to chrome.storage.local
        chrome.storage.local.set(updatedSettings, function () {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                alert('Error saving settings. Please try again.');
            } else {
                alert('Settings saved successfully.');
                loadSettings(); // Reload settings after saving
            }
        });
    }

    async function saveSetting(setting, value) {
        let updatedSetting;
        if (setting.includes('api-key')) {
            updatedSetting = { [setting]: await encryptString(value) };
        } else {
            updatedSetting = { [setting]: value };
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

    function getAuthToken() {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, function(token) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(token);
                }
            });
        });
    }

    async function deriveKey(token) {
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return crypto.subtle.importKey(
            'raw',
            hash,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function encryptString(str) {
        const token = await getAuthToken();
        const key = await deriveKey(token);
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        const encryptedArray = new Uint8Array(encrypted);
        return btoa(String.fromCharCode.apply(null, [...iv, ...encryptedArray]));
    }

    async function decryptString(encryptedStr) {
        const token = await getAuthToken();
        const key = await deriveKey(token);
        const encryptedData = atob(encryptedStr);
        const iv = new Uint8Array(encryptedData.slice(0, 12).split('').map(c => c.charCodeAt(0)));
        const data = new Uint8Array(encryptedData.slice(12).split('').map(c => c.charCodeAt(0)));
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        return new TextDecoder().decode(decrypted);
    }

    function isObfuscated(value) {
        return /^\*+.{4}$/.test(value);
    }

    async function loadSettings() {
        try {
            const result = await new Promise((resolve, reject) => {
                chrome.storage.local.get(settings, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                });
            });

            for (const setting of settings) {
                const inputElement = document.getElementById(setting);
                const displayElement = document.getElementById(`${setting}-display`);
                let value = result[setting] || '';

                if (setting.includes('api-key') && value) {
                    try {
                        const decryptedValue = await decryptString(value);
                        inputElement.value = ''; // Clear the input for security
                        const visiblePart = decryptedValue.substring(0, 4);
                        const obfuscatedPart = '*'.repeat(Math.max(0, decryptedValue.length - 4));
                        displayElement.textContent = visiblePart + obfuscatedPart;
                    } catch (error) {
                        console.error(`Error decrypting ${setting}:`, error);
                        displayElement.textContent = 'Error: Unable to decrypt';
                    }
                } else {
                    inputElement.value = value;
                    displayElement.textContent = value || 'No value set';
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            alert('Error loading settings. Please try again.');
        }
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
