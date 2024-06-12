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
<input type="text" id="openai-api-key" placeholder="Enter OpenAI API Key">
<span id="openai-api-key-value"></span>
</div>
<div class="form-group">
<label for="anthropic-api-key">Anthropic API Key:</label>
<input type="text" id="anthropic-api-key" placeholder="Enter Anthropic API Key">
<span id="anthropic-api-key-value"></span>
</div>
<div class="form-group">
<label for="graphdb-endpoint">GraphDB Endpoint:</label>
<input type="text" id="graphdb-endpoint" placeholder="Enter GraphDB Endpoint">
<span id="graphdb-endpoint-value"></span>
</div>
<div class="form-group">
<label for="graphdb-creds">GraphDB Credentials:</label>
<input type="text" id="graphdb-creds" placeholder="Enter GraphDB Credentials">
<span id="graphdb-creds-value"></span>
</div>
<div class="form-group">
<label for="local-storage-location">Local Storage Location:</label>
<input type="text" id="local-storage-location" placeholder="Enter Local Storage Location">
<span id="local-storage-location-value"></span>
</div>
<div class="form-group">
<label for="cloud-storage-endpoint">Cloud Storage Endpoint:</label>
<input type="text" id="cloud-storage-endpoint" placeholder="Enter Cloud Storage Endpoint">
<span id="cloud-storage-endpoint-value"></span>
</div>
<div class="form-group">
<label for="cloud-storage-creds">Cloud Storage Credentials:</label>
<input type="text" id="cloud-storage-creds" placeholder="Enter Cloud Storage Credentials">
<span id="cloud-storage-creds-value"></span>
</div>
<div class="form-group">
<label for="graph-source">Graph Source:</label>
<input type="text" id="graph-source" placeholder="Enter Graph Source">
document.getElementById('openai-api-key').value = localStorage.getItem('openaiApiKey') || '';
document.getElementById('openai-api-key-value').textContent = localStorage.getItem('openaiApiKey') || '';
document.getElementById('anthropic-api-key').value = localStorage.getItem('anthropicApiKey') || '';
document.getElementById('anthropic-api-key-value').textContent = localStorage.getItem('anthropicApiKey') || '';
document.getElementById('graphdb-endpoint').value = localStorage.getItem('graphdbEndpoint') || '';
document.getElementById('graphdb-endpoint-value').textContent = localStorage.getItem('graphdbEndpoint') || '';
document.getElementById('graphdb-creds').value = localStorage.getItem('graphdbCreds') || '';
document.getElementById('graphdb-creds-value').textContent = localStorage.getItem('graphdbCreds') || '';
document.getElementById('local-storage-location').value = localStorage.getItem('localStorageLocation') || '';
document.getElementById('local-storage-location-value').textContent = localStorage.getItem('localStorageLocation') || '';
document.getElementById('cloud-storage-endpoint').value = localStorage.getItem('cloudStorageEndpoint') || '';
document.getElementById('cloud-storage-endpoint-value').textContent = localStorage.getItem('cloudStorageEndpoint') || '';
document.getElementById('cloud-storage-creds').value = localStorage.getItem('cloudStorageCreds') || '';
document.getElementById('cloud-storage-creds-value').textContent = localStorage.getItem('cloudStorageCreds') || '';
document.getElementById('graph-source').value = localStorage.getItem('graphSource') || '';
document.getElementById('graph-source-value').textContent = localStorage.getItem('graphSource') || '';
document.getElementById('graph-type').value = localStorage.getItem('graphType') || '';
document.getElementById('graph-type-value').textContent = localStorage.getItem('graphType') || '';
document.getElementById('editor-settings').value = localStorage.getItem('editorSettings') || '';
document.getElementById('editor-settings-value').textContent = localStorage.getItem('editorSettings') || '';
document.getElementById('code-repo-integration').value = localStorage.getItem('codeRepoIntegration') || '';
document.getElementById('code-repo-integration-value').textContent = localStorage.getItem('codeRepoIntegration') || '';
document.getElementById('obsidian-vault-path').value = localStorage.getItem('obsidianVaultPath') || '';
document.getElementById('obsidian-vault-path-value').textContent = localStorage.getItem('obsidianVaultPath') || '';
document.getElementById('logseq-repo-path').value = localStorage.getItem('logseqRepoPath') || '';
document.getElementById('logseq-repo-path-value').textContent = localStorage.getItem('logseqRepoPath') || '';
<input type="text" id="code-repo-integration" placeholder="Enter Code Repository Integration (e.g., GitHub, GitLab)">
<span id="code-repo-integration-value"></span>
</div>
<div class="form-group">
<label for="obsidian-vault-path">Obsidian Vault Path:</label>
<input type="text" id="obsidian-vault-path" placeholder="Enter Obsidian Vault Path">
<span id="obsidian-vault-path-value"></span>
</div>
<div class="form-group">
<label for="logseq-repo-path">Logseq Repository Path:</label>
<input type="text" id="logseq-repo-path" placeholder="Enter Logseq Repository Path">
<span id="logseq-repo-path-value"></span>
        document.getElementById('logseq-repo-path').value = localStorage.getItem('logseqRepoPath') || '';
    }
});
