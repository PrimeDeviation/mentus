// ... (previous content remains unchanged)

// Expose editorModule to the global scope
window.editorModule = {
    openFileInEditor,
    createNewFile,
    saveFile,
    ensureEditorInitialized
};

// Add this function to fetch file content if it's not provided
async function fetchFileContent(fileId, source) {
    switch(source) {
        case 'googleDrive':
            const token = await new Promise((resolve) => chrome.identity.getAuthToken({ interactive: true }, resolve));
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        case 'obsidian':
            const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
            let endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
            endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash if it exists
            const url = `${endpoint}/vault/${encodeURIComponent(fileId)}`;
            const obsidianResponse = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            if (!obsidianResponse.ok) {
                throw new Error(`HTTP error! status: ${obsidianResponse.status}`);
            }
            return await obsidianResponse.text();
        default:
            throw new Error(`Unsupported file source: ${source}`);
    }
}
