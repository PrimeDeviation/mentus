let currentFileId = null;
let currentFileName = null;
let editor = null;
let editorInitialized = false;

console.log('Editor module loading');

document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
});

function initializeEditor() {
    console.log('Initializing editor');
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) {
        console.error('Editor container not found');
        return;
    }

    // Check if an editor instance already exists
    if (editor) {
        console.log('Editor already initialized');
        return;
    }

    // Remove any existing CodeMirror instances
    editorContainer.innerHTML = '';

    editor = CodeMirror(editorContainer, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'default',
        autofocus: true
    });

    editor.setSize('100%', '100%');

    // Add event listeners for save button, etc.
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.addEventListener('click', () => saveFile(currentFileId, editor.getValue()));
    }

    const createNewFileButton = document.getElementById('create-new-file');
    if (createNewFileButton) {
        createNewFileButton.addEventListener('click', createNewFile);
    }

    // Initialize other UI elements
    updateWordCount(editor.getValue());
    updateLastSaved();
    
    editor.on('change', () => {
        updateWordCount(editor.getValue());
    });

    initializeToolbar();
}

function ensureEditorInitialized() {
    if (!editor) {
        initializeEditor();
    }
}

function openFileInEditor(fileId, fileName, content, mimeType) {
    console.log('openFileInEditor called with:', { fileId, fileName, content: content ? content.substring(0, 100) + '...' : 'undefined', mimeType });
    try {
        // Set the current file ID and name
        currentFileId = fileId;
        currentFileName = fileName;

        // Set the file name in the editor
        const fileNameElement = document.getElementById('file-name');
        if (fileNameElement) {
            fileNameElement.textContent = fileName;
        } else {
            console.warn('file-name element not found');
        }

        // Ensure the editor is initialized
        ensureEditorInitialized();

        // Always fetch the content for the new file
        fetchFileContent(fileId).then(fetchedContent => {
            editor.setValue(fetchedContent);
            
            // Set the appropriate mode based on the MIME type
            let mode = 'text';
            if (mimeType === 'text/csv') {
                mode = 'csv';
            } else if (fileName.endsWith('.md')) {
                mode = 'markdown';
            }
            // Add more conditions for other file types as needed

            editor.setOption('mode', mode);

            // Force a refresh of the editor
            editor.refresh();

            // Move the cursor to the start of the document
            editor.setCursor(0, 0);

            // Focus on the editor
            editor.focus();

            console.log('File opened successfully in editor');
        }).catch(error => {
            console.error('Error fetching file content:', error);
            editor.setValue('Error loading file content');
        });

    } catch (error) {
        console.error('Error in openFileInEditor:', error);
    }
}

function createNewFile() {
    const fileName = prompt("Enter a name for the new file:");
    if (fileName) {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                console.error('Error getting auth token:', chrome.runtime.lastError);
                return;
            }
            
            window.createMarkdownFile(token, fileName, "")
                .then(file => {
                    openFileInEditor(file.id, file.name);
                    document.getElementById("create-new-file").style.display = 'none';
                })
                .catch(error => {
                    console.error('Error creating new file:', error);
                    alert('Failed to create new file. Please try again.');
                });
        });
    }
}

async function saveFile(fileId, content) {
    if (isObsidianMode) {
        saveObsidianFile(fileId, content);
    } else {
        saveGoogleDriveFile(fileId, content);
    }

    // Write to Mentus graph
    const mentusApiKey = await window.settingsModule.getSetting('graphdb-api-key');
    const mentusEndpoint = await window.settingsModule.getSetting('graphdb-endpoint');
    if (mentusApiKey && mentusEndpoint) {
        const graphData = {
            type: 'ZettelkastenNote',
            id: fileId,
            label: currentFileName
        };
        await window.graphviewModule.writeToMentusGraph(graphData, mentusApiKey, mentusEndpoint);
    }
}

async function saveObsidianFile(path, content) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    console.log('Saving Obsidian file:', path);
    console.log('Endpoint:', endpoint);
    console.log('Content length:', content.length);

    try {
        // Encode each path segment separately
        const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const url = `${endpoint}/vault/${encodedPath}`;
        console.log('Request URL:', url);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'text/markdown'
            },
            body: content
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from Obsidian API:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        console.log('File saved successfully');
        alert('File saved successfully!');
        updateLastSaved();
    } catch (error) {
        console.error('Error saving file:', error);
        alert(`Failed to save file. Error: ${error.message}\nPlease check the console for more details and try again.`);
    }
}

function saveGoogleDriveFile(fileId, content) {
    // Existing Google Drive save logic
    // ...
}

function updateWordCount(content) {
    const wordCount = document.getElementById("word-count");
    const words = content.trim().split(/\s+/).length;
    const chars = content.length;
    wordCount.textContent = `${words} words, ${chars} characters`;
}

function updateLastSaved() {
    const lastSaved = document.getElementById("last-saved");
    lastSaved.textContent = `Last saved: ${new Date().toLocaleString()}`;
}

function insertWikiLink() {
    const cursor = editor.getCursor();
    editor.replaceRange('[[]]', cursor);
    editor.setCursor(cursor.line, cursor.ch + 2);
    return true;
}

function togglePreview() {
    const previewContainer = document.getElementById("preview-container");
    const editorContainer = document.getElementById("editor-container");
    
    if (previewContainer.style.display === "none") {
        // Switch to preview mode
        previewContainer.style.display = "block";
        editorContainer.style.display = "none";
        
        // Use the marked library to convert Markdown to HTML
        previewContainer.innerHTML = marked.parse(editor.getValue());
    } else {
        // Switch back to edit mode
        previewContainer.style.display = "none";
        editorContainer.style.display = "block";
    }
}

function initializeToolbar() {
    const toolbarButtons = [
        { id: "bold", action: () => insertMarkdown('**', '**') },
        { id: "italic", action: () => insertMarkdown('*', '*') },
        { id: "header", action: () => insertMarkdown('# ', '') },
        { id: "link", action: insertLink },
        { id: "image", action: insertImage },
        { id: "list", action: () => insertMarkdown('- ', '') },
        { id: "numbered-list", action: () => insertMarkdown('1. ', '') },
        { id: "wiki-link", action: insertWikiLink }
    ];

    toolbarButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener("click", button.action);
        } else {
            console.warn(`Button with id "${button.id}" not found`);
        }
    });

    const togglePreviewButton = document.getElementById("toggle-preview");
    if (togglePreviewButton) {
        togglePreviewButton.addEventListener("click", togglePreview);
    } else {
        console.warn('Toggle preview button not found');
    }
}

function insertMarkdown(start, end) {
    const selection = editor.getSelection();
    editor.replaceSelection(`${start}${selection}${end}`);
}

function insertLink() {
    const url = prompt("Enter URL:");
    if (url) {
        insertMarkdown('[', `](${url})`);
    }
}

function insertImage() {
    const url = prompt("Enter image URL:");
    if (url) {
        insertMarkdown('![', `](${url})`);
    }
}

function updateSyntaxHint(state) {
    const syntaxHint = document.getElementById("syntax-hint");
    const cursor = state.getCursor();
    const line = state.getLine(cursor.line);
    const lineText = line.text;

    if (lineText.startsWith('#')) {
        syntaxHint.textContent = 'Header';
    } else if (lineText.startsWith('- ')) {
        syntaxHint.textContent = 'Unordered List';
    } else if (/^\d+\.\s/.test(lineText)) {
        syntaxHint.textContent = 'Ordered List';
    } else if (lineText.includes('[[')) {
        syntaxHint.textContent = 'Wiki Link';
    } else {
        syntaxHint.textContent = '';
    }
}

function updateCursorPosition(state) {
    const cursorPosition = document.getElementById("cursor-position");
    const cursor = state.getCursor();
    const line = state.getLine(cursor.line);
    cursorPosition.textContent = `Line ${cursor.line + 1}, Column ${cursor.ch + 1}`;
}

function wikiLinkCompletion(context) {
    let word = context.matchBefore(/\[\[.*?/);
    if (!word) return null;
    if (word.from == word.to && !context.explicit) return null;
    return {
        from: word.from,
        options: [
            {label: "[[Example]]", type: "text"},
            {label: "[[Sample]]", type: "text"},
            {label: "[[Test]]", type: "text"}
            // Add more options based on your existing notes
        ]
    };
}

function loadLastOpenedFile() {
    chrome.storage.local.get(['lastOpenedFile'], function(result) {
        if (result.lastOpenedFile) {
            openFileInEditor(result.lastOpenedFile.id, result.lastOpenedFile.name);
        } else {
            showCreateNewFileButton();
        }
    });
}

function showCreateNewFileButton() {
    const createNewFileButton = document.getElementById("create-new-file");
    if (createNewFileButton) createNewFileButton.style.display = 'inline-block';
}

// Expose necessary functions to the global scope
window.openFileInEditor = openFileInEditor;
window.createNewFile = createNewFile;
window.saveFile = saveFile;
window.ensureEditorInitialized = ensureEditorInitialized;

// Initialize the editor when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeEditor);

console.log('Editor module loaded');

window.editorModule = {
    openFileInEditor,
    createNewFile,
    saveFile,
    ensureEditorInitialized
};

// Add this function to fetch file content if it's not provided
async function fetchFileContent(fileId) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    const url = `${endpoint}/vault/${encodeURIComponent(fileId)}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
}
