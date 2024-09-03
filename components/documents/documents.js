let isFolderLoading = false;
let mentusFolderId = null;
let currentFolderId = null;

function initializeDocuments() {
    console.log('Initializing documents');
    const documentsList = document.getElementById('document-list');
    if (!documentsList) {
        console.error('Document list element not found');
        return;
    }

    // Check if buttons already exist
    if (!document.getElementById('delete-selected')) {
        const deleteButton = document.createElement('button');
        deleteButton.id = 'delete-selected';
        deleteButton.className = 'btn';
        deleteButton.textContent = 'Delete Selected';
        deleteButton.style.display = 'none';
        deleteButton.addEventListener('click', deleteSelectedFiles);
        documentsList.parentNode.insertBefore(deleteButton, documentsList);
    }

    if (!document.getElementById('create-folder')) {
        const createFolderButton = document.createElement('button');
        createFolderButton.id = 'create-folder';
        createFolderButton.className = 'btn';
        createFolderButton.textContent = 'Create Folder';
        createFolderButton.addEventListener('click', createNewFolder);
        documentsList.parentNode.insertBefore(createFolderButton, documentsList);
    }

    if (!document.getElementById('back-button')) {
        const backButton = document.createElement('button');
        backButton.id = 'back-button';
        backButton.className = 'btn';
        backButton.textContent = 'Back';
        backButton.style.display = 'none';
        backButton.addEventListener('click', navigateBack);
        documentsList.parentNode.insertBefore(backButton, documentsList);
    }

    chrome.storage.local.get(['mentusFolderId'], function(result) {
        if (result.mentusFolderId) {
            mentusFolderId = result.mentusFolderId;
            currentFolderId = mentusFolderId;
            loadFolderContents(mentusFolderId);
        } else {
            createMentusFolder();
        }
    });
}

function loadFolderContents(folderId) {
    if (!folderId) {
        console.error('Invalid folder ID');
        displayFolderContents([]);
        return;
    }

    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
            displayFolderContents([]);
            return;
        }

        fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType,modifiedTime,size)`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            console.log('API response:', JSON.stringify(data, null, 2));
            if (data && Array.isArray(data.files)) {
                displayFolderContents(data.files);
                updateBackButton(folderId);
            } else if (data.error) {
                console.error('API error:', data.error);
                displayFolderContents([]);
            } else {
                console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
                displayFolderContents([]);
            }
        })
        .catch(error => {
            console.error('Error loading folder contents:', error);
            displayFolderContents([]);
        });
    });
}

function displayFolderContents(files) {
    const documentsList = document.getElementById('document-list');
    if (!documentsList) {
        console.error('Document list element not found');
        return;
    }

    documentsList.innerHTML = '';
    if (!Array.isArray(files) || files.length === 0) {
        documentsList.innerHTML = `
            <p>No files found in this folder.</p>
            <p>Create a new folder or document to get started.</p>
        `;
        return;
    }

    const table = document.createElement('table');
    table.className = 'file-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Last Modified</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    files.forEach(file => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox" class="file-checkbox" data-file-id="${file.id}"></td>
            <td><a href="#" class="file-name" data-file-id="${file.id}" data-file-type="${file.mimeType}">${file.name}</a></td>
            <td>${getFileType(file.mimeType)}</td>
            <td>${formatFileSize(file.size)}</td>
            <td>${new Date(file.modifiedTime).toLocaleString()}</td>
        `;
        
        const fileNameLink = row.querySelector('.file-name');
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadFolderContents(file.id);
            });
        } else {
            fileNameLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.openFileInEditor === 'function') {
                    window.editorModule.openFileInEditor(file.id, file.name);
                    // Switch to the Editor tab
                    const editorTab = document.querySelector('.tab-button[data-tab="editor"]');
                    if (editorTab) {
                        editorTab.click();
                    }
                } else {
                    console.error('Editor module or openFileInEditor function not found');
                }
            });
        }
    });

    documentsList.appendChild(table);
    addCheckboxListeners();
}

function getFileType(mimeType) {
    const types = {
        'application/vnd.google-apps.folder': 'Folder',
        'text/markdown': 'Markdown',
        'application/vnd.google-apps.document': 'Google Doc',
        'application/vnd.google-apps.spreadsheet': 'Google Sheet',
        'application/vnd.google-apps.presentation': 'Google Slides'
    };
    return types[mimeType] || 'File';
}

function formatFileSize(size) {
    if (size == null || typeof size !== 'number') return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(2)} ${units[i]}`;
}

function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    const deleteButton = document.getElementById('delete-selected');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
            deleteButton.style.display = anyChecked ? 'block' : 'none';
        });
    });
}

function deleteSelectedFiles() {
    const selectedFiles = Array.from(document.querySelectorAll('.file-checkbox:checked'))
        .map(checkbox => checkbox.dataset.fileId);
    
    if (selectedFiles.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)/folder(s)?`)) {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError);
                return;
            }
            
            Promise.all(selectedFiles.map(fileId => 
                fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ))
            .then(() => {
                console.log('Files/folders deleted successfully');
                loadFolderContents(currentFolderId);
            })
            .catch(error => {
                console.error('Error deleting files/folders:', error);
                alert('Failed to delete some files/folders. Please try again.');
            });
        });
    }
}

function createNewFolder() {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError);
                return;
            }
            
            fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [currentFolderId]
                })
            })
            .then(response => response.json())
            .then(folder => {
                console.log('New folder created:', folder);
                loadFolderContents(currentFolderId);
            })
            .catch(error => {
                console.error('Error creating folder:', error);
                alert('Failed to create folder. Please try again.');
            });
        });
    }
}

function navigateBack() {
    if (currentFolderId === mentusFolderId) return;
    
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
            return;
        }
        
        fetch(`https://www.googleapis.com/drive/v3/files/${currentFolderId}?fields=parents`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(file => {
            if (file.parents && file.parents.length > 0) {
                const parentId = file.parents[0];
                currentFolderId = parentId;
                loadFolderContents(parentId);
            }
        })
        .catch(error => {
            console.error('Error navigating back:', error);
        });
    });
}

function updateBackButton(folderId) {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.style.display = folderId === mentusFolderId ? 'none' : 'block';
    }
}

function createMentusFolder() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error('Error getting auth token:', chrome.runtime.lastError);
            return;
        }
        fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Mentus Workspace',
                mimeType: 'application/vnd.google-apps.folder'
            })
        })
        .then(response => response.json())
        .then(folder => {
            console.log('Mentus folder created:', folder);
            mentusFolderId = folder.id;
            currentFolderId = folder.id;
            chrome.storage.local.set({ 'mentusFolderId': folder.id }, function() {
                console.log('Mentus folder ID saved');
                loadFolderContents(folder.id);
            });
        })
        .catch(error => {
            console.error('Error creating Mentus folder:', error);
        });
    });
}

// Export functions to be called from mentus_tab.js
window.initializeDocuments = initializeDocuments;
window.getMentusFolderId = () => mentusFolderId;

// Function to create a new markdown file in the current folder
function createMarkdownFile(token, fileName, content) {
    return new Promise((resolve, reject) => {
        const metadata = {
            name: fileName,
            parents: [currentFolderId],
            mimeType: 'text/markdown'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: 'text/markdown' }));

        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
        })
        .then(response => response.json())
        .then(file => {
            console.log('Markdown file created:', file);
            loadFolderContents(currentFolderId);
            resolve(file);
        })
        .catch(reject);
    });
}

window.createMarkdownFile = createMarkdownFile;

// Make sure this function is called when the Documents tab is shown
function showDocumentsTab() {
    console.log('Showing Documents tab');
    initializeDocuments();
}

// Export the showDocumentsTab function
window.showDocumentsTab = showDocumentsTab;
