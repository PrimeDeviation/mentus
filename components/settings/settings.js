document.addEventListener('DOMContentLoaded', function() {
  const settingsForm = document.getElementById('settings-form');
  const saveButton = document.getElementById('save-settings');

  // Load saved settings
  loadSettings();

  saveButton.addEventListener('click', function() {
    saveSettings();
  });

  function saveSettings() {
    const openaiApiKey = document.getElementById('openai-api-key').value.trim();
    const anthropicApiKey = document.getElementById('anthropic-api-key').value.trim();
    const graphdbEndpoint = document.getElementById('graphdb-endpoint').value.trim();
    const graphdbCreds = document.getElementById('graphdb-creds').value.trim();
    const localStorageLocation = document.getElementById('local-storage-location').value.trim();
    const cloudStorageEndpoint = document.getElementById('cloud-storage-endpoint').value.trim();
    const cloudStorageCreds = document.getElementById('cloud-storage-creds').value.trim();
    const graphSource = document.getElementById('graph-source').value.trim();
    const graphType = document.getElementById('graph-type').value.trim();
    const editorSettings = document.getElementById('editor-settings').value.trim();
    const codeRepoIntegration = document.getElementById('code-repo-integration').value.trim();
    const obsidianVaultPath = document.getElementById('obsidian-vault-path').value.trim();
    const logseqRepoPath = document.getElementById('logseq-repo-path').value.trim();

    // Validate input values
    if (!openaiApiKey || !anthropicApiKey || !graphdbEndpoint || !graphdbCreds || !localStorageLocation || !cloudStorageEndpoint || !cloudStorageCreds || !graphSource || !graphType || !editorSettings || !codeRepoIntegration || !obsidianVaultPath || !logseqRepoPath) {
      alert('Please fill in all fields.');
      return;
    }

    // Save settings to local storage
    localStorage.setItem('openaiApiKey', openaiApiKey);
    localStorage.setItem('anthropicApiKey', anthropicApiKey);
    localStorage.setItem('graphdbEndpoint', graphdbEndpoint);
    localStorage.setItem('graphdbCreds', graphdbCreds);
    localStorage.setItem('localStorageLocation', localStorageLocation);
    localStorage.setItem('cloudStorageEndpoint', cloudStorageEndpoint);
    localStorage.setItem('cloudStorageCreds', cloudStorageCreds);
    localStorage.setItem('graphSource', graphSource);
    localStorage.setItem('graphType', graphType);
    localStorage.setItem('editorSettings', editorSettings);
    localStorage.setItem('codeRepoIntegration', codeRepoIntegration);
    localStorage.setItem('obsidianVaultPath', obsidianVaultPath);
    localStorage.setItem('logseqRepoPath', logseqRepoPath);

    alert('Settings saved successfully.');
  }

  function loadSettings() {
    document.getElementById('openai-api-key').value = localStorage.getItem('openaiApiKey') || '';
    document.getElementById('anthropic-api-key').value = localStorage.getItem('anthropicApiKey') || '';
    document.getElementById('graphdb-endpoint').value = localStorage.getItem('graphdbEndpoint') || '';
    document.getElementById('graphdb-creds').value = localStorage.getItem('graphdbCreds') || '';
    document.getElementById('local-storage-location').value = localStorage.getItem('localStorageLocation') || '';
    document.getElementById('cloud-storage-endpoint').value = localStorage.getItem('cloudStorageEndpoint') || '';
    document.getElementById('cloud-storage-creds').value = localStorage.getItem('cloudStorageCreds') || '';
    document.getElementById('graph-source').value = localStorage.getItem('graphSource') || '';
    document.getElementById('graph-type').value = localStorage.getItem('graphType') || '';
    document.getElementById('editor-settings').value = localStorage.getItem('editorSettings') || '';
    document.getElementById('code-repo-integration').value = localStorage.getItem('codeRepoIntegration') || '';
    document.getElementById('obsidian-vault-path').value = localStorage.getItem('obsidianVaultPath') || '';
    document.getElementById('logseq-repo-path').value = localStorage.getItem('logseqRepoPath') || '';
  }
});
