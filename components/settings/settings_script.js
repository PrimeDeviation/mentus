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
