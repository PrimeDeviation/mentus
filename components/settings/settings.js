document.addEventListener('DOMContentLoaded', function() {
    const settingsForm = document.getElementById('settings-form');
    const saveButton = document.getElementById('save-settings');

    // Load saved settings
    chrome.storage.sync.get(['openaiApiKey', 'anthropicApiKey', 'graphdbEndpoint', 'graphdbCreds', 'localStorageLocation'], function(data) {
        document.getElementById('openai-api-key').value = data.openaiApiKey || '';
        document.getElementById('anthropic-api-key').value = data.anthropicApiKey || '';
        document.getElementById('graphdb-endpoint').value = data.graphdbEndpoint || '';
        document.getElementById('graphdb-creds').value = data.graphdbCreds || '';
        document.getElementById('local-storage-location').value = data.localStorageLocation || '';
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const openaiApiKey = document.getElementById('openai-api-key').value;
        const anthropicApiKey = document.getElementById('anthropic-api-key').value;
        const graphdbEndpoint = document.getElementById('graphdb-endpoint').value;
        const graphdbCreds = document.getElementById('graphdb-creds').value;
        const localStorageLocation = document.getElementById('local-storage-location').value;

        chrome.storage.sync.set({
            openaiApiKey: openaiApiKey,
            anthropicApiKey: anthropicApiKey,
            graphdbEndpoint: graphdbEndpoint,
            graphdbCreds: graphdbCreds,
            localStorageLocation: localStorageLocation
        }, function() {
            alert('Settings saved successfully!');
        });
    });
});
