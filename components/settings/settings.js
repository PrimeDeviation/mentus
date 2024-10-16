// Initialize SETTINGS if not already defined
if (!window.SETTINGS) {
    window.SETTINGS = [
        'openai-api-key',
        'anthropic-api-key',
        'obsidian-api-key',
        'obsidian-endpoint',
        'chat-session-path', // Changed from 'obsidian-chat-path'
        'save-to-obsidian'
    ];
}

// Add this constant at the top of the file
const DEFAULT_CHAT_SESSION_PATH = 'Mentus';

function initializeSettingsListeners() {
    console.log('Initializing settings listeners');
    if (!Array.isArray(window.SETTINGS)) {
        console.error('window.SETTINGS is not an array');
        return;
    }
    window.SETTINGS.forEach(setting => {
        const input = document.getElementById(setting);
        if (input) {
            if (input.type === 'checkbox') {
                input.addEventListener('change', function() {
                    saveCheckboxSetting(setting, input.checked);
                });
            } else {
                input.addEventListener('input', function() {
                    updateApiKeyDisplay(setting, input.value);
                });
                input.addEventListener('blur', function() {
                    saveSetting(setting, input.value);
                });
            }
        } else {
            console.warn(`Setting input not found: ${setting}`);
        }
    });

    // Add listener for toggling Obsidian instructions
    const obsidianInstructionsHeader = document.querySelector('.form-group h3');
    const obsidianInstructionsList = document.querySelector('.form-group ol');
    
    if (obsidianInstructionsHeader && obsidianInstructionsList) {
        obsidianInstructionsHeader.style.cursor = 'pointer';
        obsidianInstructionsList.style.display = 'none';
        
        obsidianInstructionsHeader.addEventListener('click', function() {
            if (obsidianInstructionsList.style.display === 'none') {
                obsidianInstructionsList.style.display = 'block';
                this.textContent = 'Obsidian Local REST API Setup (Click to hide)';
            } else {
                obsidianInstructionsList.style.display = 'none';
                this.textContent = 'Obsidian Local REST API Setup (Click to show)';
            }
        });
    }

    // Add this at the end of the function
    ensureChatSessionPath();
}

async function loadExistingSettings() {
    console.log('Loading existing settings');
    if (!Array.isArray(window.SETTINGS)) {
        console.error('window.SETTINGS is not an array');
        return;
    }
    const result = await chrome.storage.local.get(window.SETTINGS);
    window.SETTINGS.forEach(setting => {
        const input = document.getElementById(setting);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = result[setting] || false;
            } else {
                let value = result[setting] ? atob(result[setting]) : '';
                if (setting === 'chat-session-path' && !value) {
                    value = 'Mentus';
                }
                input.value = value;
                updateApiKeyDisplay(setting, value);
            }
        } else {
            console.warn(`Setting input not found: ${setting}`);
        }
    });

    // Load graph database settings
    chrome.storage.sync.get(['graphdb-endpoint', 'graphdb-api-key'], function(result) {
        if (result['graphdb-endpoint']) {
            document.getElementById('graphdb-endpoint').value = result['graphdb-endpoint'];
            updateApiKeyDisplay('graphdb-endpoint');
        }
        if (result['graphdb-api-key']) {
            document.getElementById('graphdb-api-key').value = result['graphdb-api-key'];
            updateApiKeyDisplay('graphdb-api-key');
        }
    });
}

async function saveSetting(setting, value) {
    console.log(`Saving setting: ${setting}, value: ${value}`);
    const settingToSave = {};
    settingToSave[setting] = value ? btoa(value) : '';

    try {
        await chrome.storage.local.set(settingToSave);
        updateApiKeyDisplay(setting, value);
        console.log(`Setting ${setting} saved successfully`);
    } catch (error) {
        console.error(`Error saving setting ${setting}:`, error);
    }
}

function updateApiKeyDisplay(setting, value) {
    const display = document.getElementById(`${setting}-display`);
    if (display) {
        if (value) {
            const obfuscatedValue = value.substring(0, 4) + '*'.repeat(Math.max(0, value.length - 4));
            display.textContent = obfuscatedValue;
        } else {
            display.textContent = 'No value set';
        }
    } else if (setting !== 'chat-session-path' && setting !== 'save-to-obsidian') {
        console.warn(`Display element for ${setting} not found`);
    }
}

async function saveAllSettings() {
    console.log('Saving all settings');
    if (!Array.isArray(window.SETTINGS)) {
        console.error('window.SETTINGS is not an array');
        return;
    }
    for (const setting of window.SETTINGS) {
        const input = document.getElementById(setting);
        if (input) {
            await saveSetting(setting, input.value);
        }
    }
    alert('All settings saved successfully!');
}

// Function to get a specific setting (for use in other components)
async function getSetting(setting) {
    console.log(`Attempting to get setting: ${setting}`);
    const result = await chrome.storage.local.get(setting);
    let value = result[setting] ? atob(result[setting]) : null;
    if (setting === 'chat-session-path' && !value) {
        value = 'Mentus';
    }
    console.log(`Retrieved setting ${setting}:`, value ? 'Value exists' : 'No value');
    return value;
}

// Add this function to handle checkbox setting
function saveCheckboxSetting(setting, checked) {
    const settingToSave = {};
    settingToSave[setting] = checked;
    chrome.storage.local.set(settingToSave, function() {
        console.log(`Setting ${setting} saved:`, checked);
    });
}

// Add this function to ensure the chat session path is set
async function ensureChatSessionPath() {
    const chatSessionPath = await getSetting('chat-session-path');
    if (!chatSessionPath) {
        await saveSetting('chat-session-path', 'Mentus');
    }
}

// Export functions that need to be accessible from other components
window.settingsModule = {
    getSetting,
    loadExistingSettings,
    initializeSettingsListeners,
    updateApiKeyDisplay,
    saveSetting,
    saveAllSettings,
    ensureChatSessionPath
};

// Initialize settings when the script loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('Settings script loaded');
    if (Array.isArray(window.SETTINGS)) {
        initializeSettingsListeners();
        loadExistingSettings();
    } else {
        console.error('SETTINGS not defined or not an array. Make sure mentus_tab.js is loaded before settings.js');
    }
});

// At the end of the file
window.settingsModule = {
    getSetting,
    loadExistingSettings,
    initializeSettingsListeners,
    updateApiKeyDisplay,
    saveSetting,
    saveAllSettings,
    ensureChatSessionPath
};

console.log('Settings module initialized and attached to window object');

// Add this function to check if the module is accessible
window.checkSettingsModule = function() {
    console.log('Checking settings module:', window.settingsModule);
    if (window.settingsModule) {
        console.log('Settings module methods:', Object.keys(window.settingsModule));
    }
};
