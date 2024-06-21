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
      const displayElement = document.getElementById(`${setting}-display`);
      const currentValue = inputElement.value.trim();
      const displayedValue = displayElement ? displayElement.textContent : '';

      // Only update if the value has changed and is not the obfuscated version
      if (currentValue && currentValue !== displayedValue && !isObfuscated(currentValue)) {
        updatedSettings[setting] = setting.includes('api-key') ? btoa(currentValue) : currentValue;
      }
    });

    // Save settings to chrome.storage.local
    chrome.storage.local.set(updatedSettings, function () {
      alert('Settings saved successfully.');
      loadSettings(); // Reload settings after saving
    });
  }

  function isObfuscated(value) {
    return /^\*+.{4}$/.test(value);
  }

  function loadSettings() {
    chrome.storage.local.get(['openaiApiKey', 'anthropicApiKey', 'graphdbEndpoint', 'graphdbCreds', 'localStorageLocation'], function (result) {
      document.getElementById('openai-api-key').value = result.openaiApiKey ? atob(result.openaiApiKey) : '';
      document.getElementById('anthropic-api-key').value = result.anthropicApiKey ? atob(result.anthropicApiKey) : '';
      document.getElementById('graphdb-endpoint').value = result.graphdbEndpoint || '';
      document.getElementById('graphdb-creds').value = result.graphdbCreds || '';
      document.getElementById('local-storage-location').value = result.localStorageLocation || '';
    });
  }
});
