// Initialize SETTINGS if not already defined
if (!window.SETTINGS) {
    window.SETTINGS = [
        'openai-api-key',
        'anthropic-api-key',
        'obsidian-api-key',
        'obsidian-endpoint',
        'obsidian-chat-path',
        'save-to-obsidian'
    ];
}

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

    // Add listeners for the new graph database fields
    const graphdbEndpoint = document.getElementById('graphdb-endpoint');
    const graphdbApiKey = document.getElementById('graphdb-api-key');

    if (graphdbEndpoint) {
        graphdbEndpoint.addEventListener('input', function() {
            updateApiKeyDisplay('graphdb-endpoint');
        });
    } else {
        console.warn('Graph DB endpoint input not found');
    }

    if (graphdbApiKey) {
        graphdbApiKey.addEventListener('input', function() {
            updateApiKeyDisplay('graphdb-api-key');
        });
    } else {
        console.warn('Graph DB API key input not found');
    }
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
                const value = result[setting] ? atob(result[setting]) : '';
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
    } else if (setting !== 'obsidian-chat-path' && setting !== 'save-to-obsidian') {
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
    console.log(`Retrieved setting ${setting}:`, result[setting] ? 'Value exists' : 'No value');
    return result[setting] ? atob(result[setting]) : null;
}

// Add this function to handle checkbox setting
function saveCheckboxSetting(setting, checked) {
    const settingToSave = {};
    settingToSave[setting] = checked;
    chrome.storage.local.set(settingToSave, function() {
        console.log(`Setting ${setting} saved:`, checked);
    });
}

// Export functions that need to be accessible from other components
window.settingsModule = {
    getSetting,
    loadExistingSettings,
    initializeSettingsListeners,
    updateApiKeyDisplay,
    saveSetting,
    saveAllSettings
};

// Initialize settings when the script loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('Settings script loaded');
    if (Array.isArray(window.SETTINGS)) {
        initializeSettingsListeners();
        loadExistingSettings();
        initializeObsidianInfoTooltip(); // Ensure this line is present
    } else {
        console.error('SETTINGS not defined or not an array. Make sure mentus_tab.js is loaded before settings.js');
    }
});

// Add this function to check if the module is accessible
window.checkSettingsModule = function() {
    console.log('Checking settings module:', window.settingsModule);
    if (window.settingsModule) {
        console.log('Settings module methods:', Object.keys(window.settingsModule));
    }
};

// Update the initializeObsidianInfoTooltip function
function initializeObsidianInfoTooltip() {
    console.log('Setting up Obsidian info tooltip observer');
    
    const observer = new MutationObserver((mutations, obs) => {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer && settingsContainer.offsetParent !== null) {
            const infoLink = document.getElementById('obsidian-info-link');
            if (infoLink) {
                console.log('Obsidian info link found and visible, setting up tooltip');
                obs.disconnect();
                setupTooltip(infoLink);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // Set up an event listener for tab changes
    document.addEventListener('tabChanged', function(e) {
        if (e.detail.tabName === 'settings') {
            const infoLink = document.getElementById('obsidian-info-link');
            if (infoLink) {
                console.log('Settings tab active, setting up tooltip');
                setupTooltip(infoLink);
            }
        }
    });
}

function setupTooltip(infoLink) {
    let tooltip = null;

    infoLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (tooltip) {
            document.body.removeChild(tooltip);
            tooltip = null;
        } else {
            tooltip = createTooltip(infoLink);
        }
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', (event) => {
        if (tooltip && !tooltip.contains(event.target) && event.target !== infoLink) {
            document.body.removeChild(tooltip);
            tooltip = null;
        }
    });
}

function createTooltip(infoLink) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    const instructionsContent = document.querySelector('.obsidian-instructions');
    tooltip.innerHTML = instructionsContent ? instructionsContent.innerHTML : 'Instructions not available';
    document.body.appendChild(tooltip);

    const rect = infoLink.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(tooltip);
    });
    tooltip.appendChild(closeButton);

    return tooltip;
}

// The rest of your existing code...

document.addEventListener('DOMContentLoaded', function () {
    console.log('Settings script loaded');
    if (Array.isArray(window.SETTINGS)) {
        initializeSettingsListeners();
        loadExistingSettings();
        initializeObsidianInfoTooltip();
    } else {
        console.error('SETTINGS not defined or not an array. Make sure mentus_tab.js is loaded before settings.js');
    }
});

// Add this function to check if the module is accessible
window.checkSettingsModule = function() {
    console.log('Checking settings module:', window.settingsModule);
    if (window.settingsModule) {
        console.log('Settings module methods:', Object.keys(window.settingsModule));
    }
};

window.setupObsidianInfoTooltip = function() {
    console.log('Setting up Obsidian info tooltip');
    const infoLink = document.getElementById('obsidian-info-link');
    if (!infoLink) {
        console.warn('Obsidian info link not found in the DOM');
        return;
    }

    let tooltip = null;

    infoLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (tooltip) {
            document.body.removeChild(tooltip);
            tooltip = null;
        } else {
            tooltip = createTooltip(infoLink);
        }
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', (event) => {
        if (tooltip && !tooltip.contains(event.target) && event.target !== infoLink) {
            document.body.removeChild(tooltip);
            tooltip = null;
        }
    });
}

function createTooltip(infoLink) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    const instructionsContent = document.querySelector('.obsidian-instructions');
    tooltip.innerHTML = instructionsContent ? instructionsContent.innerHTML : 'Instructions not available';
    document.body.appendChild(tooltip);

    const rect = infoLink.getBoundingClientRect();
    tooltip.style.left = `${rect.right + 10}px`;
    tooltip.style.top = `${rect.top}px`;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(tooltip);
    });
    tooltip.appendChild(closeButton);

    return tooltip;
}

// The rest of your existing code...
