let excalidrawAPI = null;

async function initializeDiagramTab() {
    console.log('Initializing Diagram Tab');
    const excalidrawWrapper = document.getElementById('excalidraw-wrapper');
    if (!excalidrawWrapper) {
        console.error('Excalidraw wrapper not found');
        return;
    }

    try {
        // Assuming Excalidraw is already loaded as a script in mentus_tab.html
        if (typeof ExcalidrawLib === 'undefined') {
            console.error('Excalidraw library not found');
            return;
        }

        excalidrawAPI = await ExcalidrawLib.default.initialize({
            container: excalidrawWrapper,
            theme: 'light'
        });

        console.log('Excalidraw initialized');

        document.getElementById('new-diagram-button').addEventListener('click', createNewDiagram);
        document.getElementById('save-diagram-button').addEventListener('click', saveDiagram);
        document.getElementById('load-diagram-button').addEventListener('click', loadDiagram);
        document.getElementById('export-diagram-button').addEventListener('click', exportDiagram);
        document.getElementById('add-to-chat-button').addEventListener('click', addToChat);

        console.log('Diagram controls initialized');
    } catch (error) {
        console.error('Error initializing Excalidraw:', error);
    }
}

function createNewDiagram() {
    console.log('Creating new diagram');
    excalidrawAPI.resetScene();
}

async function saveDiagram() {
    console.log('Saving diagram');
    const diagramData = excalidrawAPI.getSceneElements();
    const diagramName = prompt('Enter a name for the diagram:');
    if (diagramName) {
        const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
        const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
        const diagramPath = await window.settingsModule.getSetting('obsidian-diagram-path');
        const filePath = `${diagramPath}/${diagramName}.json`;

        await saveToObsidian(filePath, JSON.stringify(diagramData), apiKey, endpoint);
        alert('Diagram saved successfully!');
    }
}

async function loadDiagram() {
    console.log('Loading diagram');
    const diagramName = prompt('Enter the name of the diagram to load:');
    if (diagramName) {
        const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
        const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
        const diagramPath = await window.settingsModule.getSetting('obsidian-diagram-path');
        const filePath = `${diagramPath}/${diagramName}.json`;

        const diagramData = await loadFromObsidian(filePath, apiKey, endpoint);
        excalidrawAPI.updateScene({ elements: JSON.parse(diagramData) });
    }
}

async function exportDiagram() {
    console.log('Exporting diagram');
    const exportType = prompt('Enter export type (png, svg, json):');
    if (exportType) {
        const exportedData = await excalidrawAPI.exportToBlob({ type: exportType });
        const url = URL.createObjectURL(exportedData);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diagram.${exportType}`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

async function addToChat() {
    console.log('Adding diagram to chat');
    const diagramData = excalidrawAPI.getSceneElements();
    const chatInput = document.getElementById('chat-input');
    chatInput.value += `\n![Diagram](data:image/png;base64,${btoa(JSON.stringify(diagramData))})\n`;
}

async function saveToObsidian(filePath, content, apiKey, endpoint) {
    const url = `${endpoint}/vault/${encodeURIComponent(filePath)}`;
    await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: content
    });
}

async function loadFromObsidian(filePath, apiKey, endpoint) {
    const url = `${endpoint}/vault/${encodeURIComponent(filePath)}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return response.text();
}

// Expose the initialization function to the global scope
window.initializeDiagramTab = initializeDiagramTab;

console.log('Diagrams script loaded');