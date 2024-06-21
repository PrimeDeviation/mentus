document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('upload-button');
    const fileUpload = document.getElementById('file-upload');
    const documentsList = document.getElementById('documents-list');

    uploadButton.addEventListener('click', () => {
        const files = fileUpload.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const listItem = document.createElement('div');
                listItem.className = 'document-item';
                listItem.textContent = file.name;
                documentsList.appendChild(listItem);
            }
        }
    });

    // Function to load and display saved chat sessions
    function loadChatSessions() {
        chrome.storage.local.get(['chatSessions'], function(result) {
            const chatSessions = result.chatSessions || [];
            documentsList.innerHTML = ''; // Clear existing list
            chatSessions.forEach((session, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'document-item';
                listItem.textContent = `Chat Session ${index + 1} - ${new Date(session.timestamp).toLocaleString()}`;
                listItem.addEventListener('click', () => displayChatSession(session));
                documentsList.appendChild(listItem);
            });
        });
    }

    // Function to display a selected chat session
    function displayChatSession(session) {
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        session.messages.forEach(msg => {
            const messageElement = document.createElement('p');
            messageElement.className = msg.type === 'user' ? 'user-message' : 'assistant-message';
            messageElement.textContent = msg.content;
            chatContent.appendChild(messageElement);
        });
        
        // Replace the documents list with the chat content
        documentsList.innerHTML = '';
        documentsList.appendChild(chatContent);
        
        // Add a back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Documents';
        backButton.addEventListener('click', loadChatSessions);
        documentsList.insertBefore(backButton, chatContent);
    }

    // Load chat sessions when the documents view is initialized
    loadChatSessions();
});
