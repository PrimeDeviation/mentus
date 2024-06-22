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

  async function saveSettings() {
    const settings = [
      'openai-api-key',
      'anthropic-api-key',
      'graphdb-endpoint',
      'graphdb-creds',
      'local-storage-location'
    ];

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

  function encryptString(str) {
    // This is a simple XOR encryption. In a real-world scenario, use a more robust encryption method.
    const key = 'your-secret-key'; // Store this securely
    return str.split('').map((char, index) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
    ).join('');
  }

  function decryptString(str) {
    // Decryption for the simple XOR method
    return encryptString(str); // XOR encryption is symmetric
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
          const decryptedValue = decryptString(value);
          inputElement.value = ''; // Clear the input for security
          const visiblePart = decryptedValue.substring(0, 4);
          const obfuscatedPart = '*'.repeat(Math.max(0, decryptedValue.length - 4));
          displayElement.textContent = visiblePart + obfuscatedPart;
        } else {
          inputElement.value = value;
          displayElement.textContent = value || 'No value set';
        }
      });
    });
  }
});
