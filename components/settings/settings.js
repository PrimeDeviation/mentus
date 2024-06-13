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
        const openaiApiKey = localStorage.getItem('openaiApiKey') || '';
        const anthropicApiKey = localStorage.getItem('anthropicApiKey') || '';
        const graphdbEndpoint = localStorage.getItem('graphdbEndpoint') || '';
        const graphdbCreds = localStorage.getItem('graphdbCreds') || '';
        const localStorageLocation = localStorage.getItem('localStorageLocation') || '';
        const cloudStorageEndpoint = localStorage.getItem('cloudStorageEndpoint') || '';
        const cloudStorageCreds = localStorage.getItem('cloudStorageCreds') || '';
        const graphSource = localStorage.getItem('graphSource') || '';
        const graphType = localStorage.getItem('graphType') || '';
        const editorSettings = localStorage.getItem('editorSettings') || '';
        const codeRepoIntegration = localStorage.getItem('codeRepoIntegration') || '';
        const obsidianVaultPath = localStorage.getItem('obsidianVaultPath') || '';
        const logseqRepoPath = localStorage.getItem('logseqRepoPath') || '';

        document.getElementById('openai-api-key').value = openaiApiKey;
        document.getElementById('anthropic-api-key').value = anthropicApiKey;
        document.getElementById('graphdb-endpoint').value = graphdbEndpoint;
        document.getElementById('graphdb-creds').value = graphdbCreds;
        document.getElementById('local-storage-location').value = localStorageLocation;
        document.getElementById('cloud-storage-endpoint').value = cloudStorageEndpoint;
        document.getElementById('cloud-storage-creds').value = cloudStorageCreds;
        document.getElementById('graph-source').value = graphSource;
        document.getElementById('graph-type').value = graphType;
        document.getElementById('editor-settings').value = editorSettings;
        document.getElementById('code-repo-integration').value = codeRepoIntegration;
        document.getElementById('obsidian-vault-path').value = obsidianVaultPath;
        document.getElementById('logseq-repo-path').value = logseqRepoPath;

        document.getElementById('current-openai-api-key').textContent = openaiApiKey ? '****' + openaiApiKey.slice(-4) : '';
        document.getElementById('current-anthropic-api-key').textContent = anthropicApiKey ? '****' + anthropicApiKey.slice(-4) : '';
        document.getElementById('current-graphdb-endpoint').textContent = graphdbEndpoint;
        document.getElementById('current-graphdb-creds').textContent = graphdbCreds ? '****' + graphdbCreds.slice(-4) : '';
        document.getElementById('current-local-storage-location').textContent = localStorageLocation;
        document.getElementById('current-cloud-storage-endpoint').textContent = cloudStorageEndpoint;
        document.getElementById('current-cloud-storage-creds').textContent = cloudStorageCreds ? '****' + cloudStorageCreds.slice(-4) : '';
        document.getElementById('current-graph-source').textContent = graphSource;
        document.getElementById('current-graph-type').textContent = graphType;
        document.getElementById('current-editor-settings').textContent = editorSettings;
        document.getElementById('current-code-repo-integration').textContent = codeRepoIntegration;
        document.getElementById('current-obsidian-vault-path').textContent = obsidianVaultPath;
        document.getElementById('current-logseq-repo-path').textContent = logseqRepoPath;
    }
});
