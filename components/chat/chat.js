document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatModels = document.getElementById('chat-models');
    const savedSessions = document.getElementById('saved-sessions');
    const saveSessionButton = document.getElementById('save-session-button');
    const newSessionButton = document.getElementById('new-session-button');

    let currentSessionId = null;
    let sessions = {};

    function initializeChat() {
        loadChatModels();
        loadSessions();
        initializeChatListeners();
    }

    function loadChatModels() {
        // Implementation for loading chat models
    }

    function loadSessions() {
        // Implementation for loading saved sessions
    }

    function initializeChatListeners() {
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        saveSessionButton.addEventListener('click', saveSession);
        newSessionButton.addEventListener('click', startNewSession);
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat('user-message', message);
            // Implement API call to get response
            chatInput.value = '';
        }
    }

    function addMessageToChat(className, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${className}`;
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function saveSession() {
        // Implementation for saving the current session
    }

    function startNewSession() {
        // Implementation for starting a new session
    }

    initializeChat();
});
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatModels = document.getElementById('chat-models');
    const savedSessions = document.getElementById('saved-sessions');
    const saveSessionButton = document.getElementById('save-session-button');
    const newSessionButton = document.getElementById('new-session-button');

    let currentSessionId = null;
    let sessions = {};

    function initializeChat() {
        loadChatModels();
        loadSessions();
        initializeChatListeners();
    }

    function loadChatModels() {
        // Implementation for loading chat models
    }

    function loadSessions() {
        // Implementation for loading saved sessions
    }

    function initializeChatListeners() {
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        saveSessionButton.addEventListener('click', saveSession);
        newSessionButton.addEventListener('click', startNewSession);
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat('user-message', message);
            // Implement API call to get response
            chatInput.value = '';
        }
    }

    function addMessageToChat(className, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${className}`;
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function saveSession() {
        // Implementation for saving the current session
    }

    function startNewSession() {
        // Implementation for starting a new session
    }

    initializeChat();
});
