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
    const openaiApiKey = document.getElementById('openai-api-key').value.trim();
    const anthropicApiKey = document.getElementById('anthropic-api-key').value.trim();
    const graphdbEndpoint = document.getElementById('graphdb-endpoint').value.trim();
    const graphdbCreds = document.getElementById('graphdb-creds').value.trim();
    const localStorageLocation = document.getElementById('local-storage-location').value.trim();

    // Save settings to chrome.storage.local
    chrome.storage.local.set({
      openaiApiKey: btoa(openaiApiKey),
      anthropicApiKey: btoa(anthropicApiKey),
      graphdbEndpoint: graphdbEndpoint,
      graphdbCreds: graphdbCreds,
      localStorageLocation: localStorageLocation
    }, function () {
      alert('Settings saved successfully.');
      loadSettings();
      window.location.reload();
    });
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
