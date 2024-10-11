let isFolderLoading = false;
let mentusFolderId = null;
let currentFolderId = null;
let obsidianConfigured = false;
let currentObsidianPath = '';
let isObsidianMode = false;
let isDocumentsInitialized = false;
let isInitializingDocuments = false;

async function initializeDocuments() {
    if (isInitializingDocuments) {
        console.log('Documents initialization already in progress, skipping');
        return;
    }
    if (isDocumentsInitialized) {
        console.log('Documents already initialized, skipping');
        return;
    }
    console.log('Initializing documents');
    isInitializingDocuments = true;

    try {
        const documentsList = document.getElementById('document-list');
        if (!documentsList) {
            console.error('Document list element not found');
            return;
        }

        console.log('Document list element found:', !!documentsList);
        console.log('Current document list content:', documentsList.innerHTML);

        // Clear existing content only if it's not already empty
        if (documentsList.innerHTML.trim() !== '') {
            documentsList.innerHTML = '';
        }

        // Check if Google Drive or Obsidian is configured
        const driveConfigured = await checkGoogleDriveConfiguration();
        const obsidianConfigured = await checkObsidianConfiguration();

        // If neither is configured, inform the user
        if (!driveConfigured && !obsidianConfigured) {
            documentsList.innerHTML = '<p>Please configure a documents source in the Settings tab.</p>';
            return;
        }

        // Create source buttons
        if (driveConfigured) {
            console.log('Creating Google Drive button');
            const driveButton = createSourceButton('Google Drive', loadGoogleDriveDocuments);
            documentsList.appendChild(driveButton);
        }

        if (obsidianConfigured) {
            console.log('Creating Obsidian button');
            const obsidianStatus = await getObsidianStatus();
            console.log('Obsidian status:', obsidianStatus);
            if (obsidianStatus) {
                const obsidianButton = createSourceButton('Obsidian Vault', loadObsidianDocuments);
                documentsList.appendChild(obsidianButton);
            } else {
                console.log('Obsidian API is not available');
                documentsList.innerHTML += `
                    <p>Obsidian API is configured but not available. Please check your Obsidian settings:</p>
                    <ul>
                        <li>Ensure the Obsidian Local REST API plugin is installed and enabled in your Obsidian vault.</li>
                        <li>Verify that the API key in the extension settings matches the one in the Obsidian plugin settings.</li>
                        <li>Check that the endpoint URL in the extension settings is correct (e.g., http://localhost:27123 or https://localhost:27124).</li>
                        <li>Make sure your Obsidian vault is open and the Local REST API plugin is running.</li>
                    </ul>
                `;
            }
        }

        console.log('Buttons created. Current document list content:', documentsList.innerHTML);

        isDocumentsInitialized = true;
    } catch (error) {
        console.error('Error initializing documents:', error);
    } finally {
        isInitializingDocuments = false;
    }
}

async function getObsidianStatus() {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    if (!apiKey || !endpoint) {
        console.error('Obsidian API key or endpoint not set');
        return false;
    }

    console.log('Attempting to connect to Obsidian API:', endpoint);

    try {
        // Remove trailing slash if present
        const url = endpoint.replace(/\/$/, '');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Obsidian API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Obsidian API:', response.status, errorText);
            return false;
        }

        const data = await response.json();
        console.log('Obsidian API status:', data);
        return data.status === "OK";
    } catch (error) {
        console.error('Error fetching Obsidian status:', error);
        return false;
    }
}

function createSourceButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'source-button';
    button.addEventListener('click', onClick);
    return button;
}

async function checkGoogleDriveConfiguration() {
    console.log('Checking Google Drive configuration');
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error checking Google Drive configuration:', chrome.runtime.lastError);
                resolve(false);
            } else {
                console.log('Google Drive is configured (user is authenticated)');
                resolve(true);
            }
        });
    });
}

async function checkObsidianConfiguration() {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    console.log('Checking Obsidian configuration:');
    console.log('API Key exists:', !!apiKey);
    console.log('Endpoint exists:', !!endpoint);
    return !!(apiKey && endpoint);
}

async function ensureMentusWorkspaceFolder(token) {
    console.log('Ensuring Mentus Workspace folder exists');
    try {
        // Search for an existing "Mentus Workspace" folder
        const searchResponse = await fetch(
            'https://www.googleapis.com/drive/v3/files?q=name%3D%27Mentus%20Workspace%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27%20and%20trashed%3Dfalse',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            const folderId = searchData.files[0].id;
            console.log('Existing Mentus Workspace folder found:', folderId);
            await chrome.storage.local.set({ mentusFolderId: folderId });
            return folderId;
        }

        // If the folder doesn't exist, create it
        console.log('Mentus Workspace folder not found, creating a new one');
        const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Mentus Workspace',
                mimeType: 'application/vnd.google-apps.folder'
            })
        });
        const folder = await createResponse.json();
        console.log('New Mentus Workspace folder created:', folder.id);
        await chrome.storage.local.set({ mentusFolderId: folder.id });
        return folder.id;
    } catch (error) {
        console.error('Error ensuring Mentus Workspace folder:', error);
        throw error;
    }
}

function loadGoogleDriveDocuments() {
    console.log('Loading Google Drive documents');
    isObsidianMode = false;
    chrome.identity.getAuthToken({ interactive: true }, async function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
            alert('Failed to authenticate with Google. Please check your Google account connection in the User Profile tab.');
            return;
        }
        
        console.log('Google Auth token received');
        try {
            const folderId = await ensureMentusWorkspaceFolder(token);
            console.log('Mentus Workspace folder ID:', folderId);
            mentusFolderId = folderId;
            currentFolderId = folderId;
            loadFolderContents(folderId, token);
        } catch (error) {
            console.error('Error setting up Mentus Workspace:', error);
            alert('Failed to set up Mentus Workspace. Please try again.');
        }
    });
}

function loadFolderContents(folderId, token) {
    if (isFolderLoading) return;
    isFolderLoading = true;

    fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and (mimeType='application/vnd.google-apps.folder' or fileExtension='md')&fields=files(id,name,mimeType,modifiedTime)`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayFolderContents(data.files, folderId, token);
        isFolderLoading = false;
    })
    .catch(error => {
        console.error('Error fetching folder contents:', error);
        alert('Failed to load Google Drive documents. Please try again.');
        isFolderLoading = false;
    });
}

function displayFolderContents(files, folderId, token) {
    const documentsList = document.getElementById('document-list');
    documentsList.innerHTML = '';

    // Add back button
    const backButton = createBackButton(() => {
        if (folderId === mentusFolderId) {
            showTopLevelView();
        } else {
            chrome.identity.getAuthToken({ interactive: false }, function(newToken) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting auth token:', chrome.runtime.lastError);
                    return;
                }
                getParentFolder(folderId, newToken);
            });
        }
    });
    documentsList.appendChild(backButton);

    // Add create folder button
    const createFolderButton = document.createElement('button');
    createFolderButton.textContent = 'Create Folder';
    createFolderButton.addEventListener('click', () => createFolder(folderId, token));
    documentsList.appendChild(createFolderButton);

    const table = document.createElement('table');
    table.className = 'file-browser';
    
    const headerRow = table.insertRow();
    ['Name', 'Type', 'Modified', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    files.forEach(file => {
        const row = table.insertRow();
        
        const nameCell = row.insertCell();
        const fileNameLink = document.createElement('a');
        fileNameLink.textContent = file.name;
        fileNameLink.href = '#';
        nameCell.appendChild(fileNameLink);

        const typeCell = row.insertCell();
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        typeCell.textContent = isFolder ? 'Folder' : 'Markdown';

        const modifiedCell = row.insertCell();
        modifiedCell.textContent = new Date(file.modifiedTime).toLocaleString();

        const actionsCell = row.insertCell();
        const openButton = document.createElement('button');
        openButton.textContent = isFolder ? 'Open' : 'View';
        openButton.addEventListener('click', () => handleGoogleDriveFileAction(file, token));
        actionsCell.appendChild(openButton);

        if (isFolder) {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadFolderContents(file.id, token);
            });
        } else {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                openGoogleDriveFile(file, token);
            });
        }
    });

    documentsList.appendChild(table);
}

function handleGoogleDriveFileAction(file, token) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
        loadFolderContents(file.id, token);
    } else {
        openGoogleDriveFile(file, token);
    }
}

function getParentFolder(folderId, token) {
    fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=parents`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.parents && data.parents.length > 0) {
            loadFolderContents(data.parents[0], token);
        } else {
            console.log('No parent folder found');
        }
    })
    .catch(error => {
        console.error('Error getting parent folder:', error);
    });
}

function openGoogleDriveFile(file, token) {
    console.log('Attempting to open file:', file);

    fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        console.log('File fetch response:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(content => {
        console.log('File content retrieved, length:', content.length);
        if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.openFileInEditor === 'function') {
            console.log('Calling openFileInEditor function');
            window.editorModule.openFileInEditor(file.id, file.name, content, 'text/markdown');
            
            // Switch to the Editor tab
            const editorTab = document.querySelector('.tab-button[data-tab="editor"]');
            if (editorTab) {
                console.log('Switching to Editor tab');
                editorTab.click();
            } else {
                console.warn('Editor tab button not found');
            }
        } else {
            console.error('Editor module or openFileInEditor function not found');
            alert('Unable to open the file in the editor. Please check the console for more details.');
        }
    })
    .catch(error => {
        console.error('Error opening file:', error);
        alert(`Failed to open the file: ${error.message}. Please check the console for more details.`);
    });
}

function createFolder(parentFolderId, token) {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        })
    })
    .then(response => response.json())
    .then(folder => {
        console.log('Folder created:', folder);
        loadFolderContents(parentFolderId, token);
    })
    .catch(error => {
        console.error('Error creating folder:', error);
        alert('Failed to create folder. Please try again.');
    });
}

async function loadObsidianDocuments() {
    console.log('Loading Obsidian documents');
    isObsidianMode = true;
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    console.log('Obsidian API Key:', apiKey ? 'Set' : 'Not set');
    console.log('Obsidian Endpoint:', endpoint);

    if (!apiKey || !endpoint) {
        console.error('Obsidian API key or endpoint not set');
        alert('Obsidian API key or endpoint not set. Please check your settings.');
        return;
    }

    try {
        await loadObsidianDirectory('');
    } catch (error) {
        console.error('Error fetching Obsidian files:', error);
        alert(`Failed to load Obsidian documents: ${error.message}\n\nPlease check the console for more details.`);
    }
}

async function loadObsidianDirectory(path) {
    currentObsidianPath = path;
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    try {
        const url = `${endpoint.replace(/\/$/, '')}/vault/${encodeURIComponent(path)}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 404) {
            console.warn(`Directory not found: ${path}`);
            displayObsidianFiles([], path); // Display empty directory
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Obsidian API:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Obsidian API response:', data);

        if (!data.files || !Array.isArray(data.files)) {
            console.error('Unexpected response format:', data);
            throw new Error('Unexpected response format from Obsidian API');
        }

        displayObsidianFiles(data.files, path);
    } catch (error) {
        console.error('Error loading Obsidian directory:', error);
        alert('Failed to load directory. Please check your Obsidian settings and ensure the API is running.');
    }
}

function displayObsidianFiles(files, currentPath) {
    console.log('Displaying Obsidian files:', files);
    const documentsList = document.getElementById('document-list');
    documentsList.innerHTML = '';

    // Add back button
    const backButton = createBackButton(() => {
        if (currentPath === '') {
            showTopLevelView();
        } else {
            const parentPath = getParentPath(currentPath);
            loadObsidianDirectory(parentPath);
        }
    });
    documentsList.appendChild(backButton);

    const table = document.createElement('table');
    table.className = 'file-browser';
    
    const headerRow = table.insertRow();
    ['Name', 'Type', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    files.forEach(file => {
        const row = table.insertRow();
        
        const nameCell = row.insertCell();
        const fileNameLink = document.createElement('a');
        fileNameLink.textContent = file;
        fileNameLink.href = '#';
        nameCell.appendChild(fileNameLink);

        const typeCell = row.insertCell();
        const isDirectory = file.endsWith('/');
        typeCell.textContent = isDirectory ? 'Folder' : 'File';

        const actionsCell = row.insertCell();
        const openButton = document.createElement('button');
        openButton.textContent = isDirectory ? 'Open' : 'View';
        openButton.addEventListener('click', () => handleFileAction(file, isDirectory));
        actionsCell.appendChild(openButton);

        if (isDirectory) {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadObsidianDirectory(currentPath + file);
            });
        } else {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                openObsidianFile(currentPath + file);
            });
        }

        if (!isDirectory) {
            if (file.startsWith('chat_session_')) {
                openButton.textContent = 'Open in Chat';
                openButton.addEventListener('click', () => openChatSession(currentPath + file));
            } else {
                openButton.textContent = 'View';
                openButton.addEventListener('click', () => openObsidianFile(currentPath + file));
            }
        }
    });

    documentsList.appendChild(table);
}

function handleFileAction(file, isDirectory) {
    if (isDirectory) {
        loadObsidianDirectory(currentObsidianPath + file);
    } else {
        openObsidianFile(currentObsidianPath + file);
    }
}

function getParentPath(path) {
    const parts = path.split('/').filter(part => part !== '');
    if (parts.length <= 1) {
        return '';
    }
    return parts.slice(0, -1).join('/') + '/';
}

async function openObsidianFile(path) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    console.log('Opening Obsidian file:', path);

    try {
        const url = `${endpoint}/vault/${encodeURIComponent(path)}`;
        console.log('Request URL:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.status === 404) {
            console.warn(`File not found: ${path}`);
            alert(`The file "${path}" was not found in your Obsidian vault.`);
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Obsidian API:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const content = await response.text();
        
        // Open the file in the editor
        if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.openFileInEditor === 'function') {
            window.editorModule.openFileInEditor(path, path.split('/').pop(), content);
            // Switch to the Editor tab
            const editorTab = document.querySelector('.tab-button[data-tab="editor"]');
            if (editorTab) {
                editorTab.click();
            }
        } else {
            console.error('Editor module or openFileInEditor function not found');
        }
    } catch (error) {
        console.error('Error opening Obsidian file:', error);
        alert('Failed to open the file. Please check the console for more details and try again.');
    }
}

function openChatSession(path) {
    // Implement this function to open the chat session in the chat interface
    console.log('Opening chat session:', path);
    // You'll need to implement the logic to load this session into the chat interface
}

function showDocumentsTab() {
    console.log('Showing documents tab');
    if (!isDocumentsInitialized) {
        showTopLevelView();
    } else {
        console.log('Documents already initialized, not reinitializing');
    }
}

async function createMarkdownFile(token, fileName, content) {
    const metadata = {
        name: fileName,
        mimeType: 'text/markdown',
        parents: [mentusFolderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'text/markdown' }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
    });

    return response.json();
}

function createBackButton(onClick) {
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.id = 'back-button';
    backButton.addEventListener('click', onClick);
    return backButton;
}

function showTopLevelView() {
    console.log('Showing top-level view');
    isObsidianMode = false;
    currentFolderId = null;
    currentObsidianPath = '';
    isDocumentsInitialized = false;
    initializeDocuments();
}

// Export functions to be called from mentus_tab.js
window.initializeDocuments = initializeDocuments;
window.getMentusFolderId = () => mentusFolderId;
window.showDocumentsTab = showDocumentsTab;
window.createMarkdownFile = createMarkdownFile;
window.loadObsidianDocuments = loadObsidianDocuments;
window.showTopLevelView = showTopLevelView;

// Export functions to be called from other modules
window.ensureMentusWorkspaceFolder = ensureMentusWorkspaceFolder;

// Add this line to check if the script is loaded
console.log('Documents script loaded');