document.addEventListener('DOMContentLoaded', function () {
    const SETTINGS = [
        'openai-api-key',
        'anthropic-api-key',
        'graphdb-endpoint',
        'graphdb-creds',
        'local-storage-location'
    ];

    loadSettings();
    initializeSettingsListeners();

    function initializeSettingsListeners() {
        SETTINGS.forEach(setting => {
            const inputElement = document.getElementById(setting);
            if (inputElement) {
                inputElement.addEventListener('input', debounce(() => saveSetting(setting, inputElement.value), 500));
            }
        });
    }

    async function loadSettings() {
        try {
            const result = await chrome.storage.local.get(SETTINGS);
            SETTINGS.forEach(setting => updateSettingDisplay(setting, result[setting] || ''));
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    function updateSettingDisplay(setting, value) {
        const inputElement = document.getElementById(setting);
        const displayElement = document.getElementById(`${setting}-display`);
        
        if (!inputElement || !displayElement) {
            console.error(`Element not found for setting: ${setting}`);
            return;
        }

        if (setting.includes('api-key') && value) {
            try {
                const decodedValue = atob(value);
                inputElement.value = '';
                displayElement.textContent = `${decodedValue.substring(0, 4)}${'*'.repeat(Math.max(0, decodedValue.length - 4))}`;
            } catch (e) {
                console.error('Error processing API key:', e);
                displayElement.textContent = 'Error: Invalid API key';
            }
        } else {
            inputElement.value = value;
            displayElement.textContent = value || 'No value set';
        }
    }

    async function saveSetting(setting, value) {
        const encodedValue = setting.includes('api-key') ? btoa(value) : value;
        try {
            await chrome.storage.local.set({ [setting]: encodedValue });
            console.log(`Setting saved: ${setting}`);
            updateSettingDisplay(setting, encodedValue);
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
