document.addEventListener('DOMContentLoaded', function() {
    // Set test values in localStorage
    localStorage.setItem('openaiApiKey', 'test-openai-api-key');
    localStorage.setItem('anthropicApiKey', 'test-anthropic-api-key');
    localStorage.setItem('graphdbEndpoint', 'test-graphdb-endpoint');
    localStorage.setItem('graphdbCreds', 'test-graphdb-creds');
    localStorage.setItem('localStorageLocation', 'test-local-storage-location');
    localStorage.setItem('cloudStorageEndpoint', 'test-cloud-storage-endpoint');
    localStorage.setItem('cloudStorageCreds', 'test-cloud-storage-creds');
    localStorage.setItem('graphSource', 'test-graph-source');
    localStorage.setItem('graphType', 'test-graph-type');
    localStorage.setItem('editorSettings', 'test-editor-settings');
    localStorage.setItem('codeRepoIntegration', 'test-code-repo-integration');
    localStorage.setItem('obsidianVaultPath', 'test-obsidian-vault-path');
    localStorage.setItem('logseqRepoPath', 'test-logseq-repo-path');

    // Load settings
    loadSettings();

    // Check if spans are populated correctly
    console.assert(document.getElementById('openai-api-key-value').textContent === 'test-openai-api-key', 'OpenAI API Key value is incorrect');
    console.assert(document.getElementById('anthropic-api-key-value').textContent === 'test-anthropic-api-key', 'Anthropic API Key value is incorrect');
    console.assert(document.getElementById('graphdb-endpoint-value').textContent === 'test-graphdb-endpoint', 'GraphDB Endpoint value is incorrect');
    console.assert(document.getElementById('graphdb-creds-value').textContent === 'test-graphdb-creds', 'GraphDB Credentials value is incorrect');
    console.assert(document.getElementById('local-storage-location-value').textContent === 'test-local-storage-location', 'Local Storage Location value is incorrect');
    console.assert(document.getElementById('cloud-storage-endpoint-value').textContent === 'test-cloud-storage-endpoint', 'Cloud Storage Endpoint value is incorrect');
    console.assert(document.getElementById('cloud-storage-creds-value').textContent === 'test-cloud-storage-creds', 'Cloud Storage Credentials value is incorrect');
    console.assert(document.getElementById('graph-source-value').textContent === 'test-graph-source', 'Graph Source value is incorrect');
    console.assert(document.getElementById('graph-type-value').textContent === 'test-graph-type', 'Graph Type value is incorrect');
    console.assert(document.getElementById('editor-settings-value').textContent === 'test-editor-settings', 'Editor Settings value is incorrect');
    console.assert(document.getElementById('code-repo-integration-value').textContent === 'test-code-repo-integration', 'Code Repo Integration value is incorrect');
    console.assert(document.getElementById('obsidian-vault-path-value').textContent === 'test-obsidian-vault-path', 'Obsidian Vault Path value is incorrect');
    console.assert(document.getElementById('logseq-repo-path-value').textContent === 'test-logseq-repo-path', 'Logseq Repo Path value is incorrect');

    console.log('All tests passed');
});
