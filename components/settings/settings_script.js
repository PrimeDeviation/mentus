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

  function isBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
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
          // Encode API keys
          const encodedValue = btoa(currentValue);
          if (isBase64(encodedValue)) {
            updatedSettings[setting] = encodedValue;
          } else {
            console.error(`Failed to encode ${setting}`);
            alert(`Failed to encode ${setting}. Please check the input.`);
            return;
          }
        } else {
          updatedSettings[setting] = currentValue;
        }
      }
    });

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

  function isObfuscated(value) {
    return /^\*+.{4}$/.test(value);
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
          if (isBase64(value)) {
            try {
              // Decode API keys
              const decodedValue = atob(value);
              inputElement.value = ''; // Clear the input field for security
              const visiblePart = decodedValue.substring(0, 4);
              const obfuscatedPart = '*'.repeat(Math.max(0, decodedValue.length - 4));
              displayElement.textContent = visiblePart + obfuscatedPart;
            } catch (e) {
              console.error('Error decoding API key:', e);
              displayElement.textContent = 'Error: Invalid API key format';
            }
          } else {
            console.error('Stored API key is not valid base64');
            displayElement.textContent = 'Error: Invalid API key format';
          }
        } else {
          inputElement.value = value;
          displayElement.textContent = value || 'No value set';
        }
      });
    });
  }
});
