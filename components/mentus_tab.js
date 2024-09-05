// Constants for settings and chat models
window.SETTINGS = [
  'openai-api-key',
  'anthropic-api-key',
  'obsidian-api-key',
  'obsidian-endpoint',
  'obsidian-chat-path',
  'save-to-obsidian'
];

const CHAT_MODELS = {
  openai: [
    'gpt-3.5-turbo', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k', 
    'gpt-3.5-turbo-instruct', 'gpt-3.5-turbo-instruct-0914', 'gpt-4', 'gpt-4-0125-preview', 
    'gpt-4-0613', 'gpt-4-1106-preview', 'gpt-4-1106-vision-preview', 'gpt-4-turbo', 
    'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-vision-preview', 'gpt-4o', 
    'gpt-4o-2024-05-13', 'gpt-4o-mini', 'chatgpt-4o-latest', 'gpt-4o-2024-08-06'
  ],
  anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307', 'claude-2.1']
};

// Global variables for managing sessions
let sessions = {};
let currentSession = {
  id: null,
  messages: [],
  model: null
};

let profileDataReady = false;

// Initialize the Mentus Tab
async function initializeMentusTab() {
  try {
    console.log('Initializing Mentus Tab');
    initializeTabButtons();
    console.log('Tab buttons initialized');
    initializeDraggableResizer();
    initializeDarkModeToggle();
    console.log('Dark mode toggle initialized');

    // Load settings first
    if (window.settingsModule) {
      console.log('Loading existing settings');
      await window.settingsModule.loadExistingSettings();
      console.log('Initializing settings listeners');
      window.settingsModule.initializeSettingsListeners();
    } else {
      console.error('Settings module not found');
    }

    // Load chat models after settings are loaded
    console.log('About to load chat models');
    await loadChatModels();
    console.log('Chat models loaded');

    // Initialize Obsidian
    console.log('Initializing Obsidian');
    await initializeObsidian();
    console.log('Obsidian initialized');

    // Load sessions
    console.log('Loading sessions');
    const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
    if (saveToObsidian) {
      await loadObsidianSessions();
    } else {
      await loadSessions();
    }
    console.log('Sessions loaded');
    updateSessionList();

    initializeChatListeners();
    console.log('Chat listeners initialized');
    initializeDocumentsListeners();
    console.log('Document listeners initialized');
    initializeSessionListeners();
    console.log('Session listeners initialized');

    if (!currentSession.id) {
      console.log('Starting new session');
      startNewSession();
    }

    // Show the settings tab by default
    showTab('settings');
    console.log('Settings tab displayed');

    console.log('Mentus Tab initialization complete');
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

function initializeDraggableResizer() {
  console.log('Initializing draggable resizer');
  const chatbar = document.getElementById('chatbar');
  const resizeHandle = document.getElementById('resize-handle');
  const content = document.getElementById('content');

  if (!chatbar || !resizeHandle || !content) {
      console.error('One or more elements for draggable resizer not found');
      return;
  }

  let isResizing = false;

  resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
  });

  function handleMouseMove(e) {
      if (!isResizing) return;
      const newWidth = e.clientX;
      chatbar.style.width = `${newWidth}px`;
      content.style.width = `calc(100% - ${newWidth}px)`;
  }

  function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
  }

  console.log('Draggable resizer initialized');
}

async function initializeObsidian() {
  console.log('Initializing Obsidian');
  try {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    if (!apiKey || !endpoint) {
      console.log('Obsidian API key or endpoint not set, skipping initialization');
      return;
    }

    console.log('Obsidian settings loaded');
    
    // Optionally, you can check the connection to Obsidian here
    const isConnected = await checkObsidianConnection(apiKey, endpoint);
    if (isConnected) {
      console.log('Successfully connected to Obsidian');
    } else {
      console.warn('Failed to connect to Obsidian');
    }
  } catch (error) {
    console.error('Error initializing Obsidian:', error);
  }
}

async function checkObsidianConnection(apiKey, endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking Obsidian connection:', error);
    return false;
  }
}
// Initialize tab buttons
function initializeTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      showTab(tabName);
    });
  });
}

// Show a specific tab
function showTab(tabName) {
  console.log(`Showing tab: ${tabName}`);
  
  const tabContents = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-button');

  tabContents.forEach(content => content.style.display = 'none');
  tabButtons.forEach(button => button.classList.remove('active'));

  const activeTab = document.getElementById(tabName);
  const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);

  if (activeTab && activeButton) {
    activeTab.style.width = '100%';
    activeTab.style.display = 'block';
    activeButton.classList.add('active');
    console.log(`Tab ${tabName} is now visible`);

    // Additional logic for specific tabs
    if (tabName === 'docs') {
      if (typeof window.showDocumentsTab === 'function') {
        window.showDocumentsTab();
      }
    } else if (tabName === 'editor') {
      if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.ensureEditorInitialized === 'function') {
        window.editorModule.ensureEditorInitialized();
      }
    }
  } else {
    console.error(`Tab content or button not found for: ${tabName}`);
  }
}

// Load chat models
async function loadChatModels() {
  console.log('Entering loadChatModels function');
  try {
    console.log('Attempting to get OpenAI API key');
    const openaiApiKey = await window.settingsModule.getSetting('openai-api-key');
    console.log('OpenAI API Key retrieved:', openaiApiKey ? 'Yes (length: ' + openaiApiKey.length + ')' : 'No');
    
    console.log('Attempting to get Anthropic API key');
    const anthropicApiKey = await window.settingsModule.getSetting('anthropic-api-key');
    console.log('Anthropic API Key retrieved:', anthropicApiKey ? 'Yes (length: ' + anthropicApiKey.length + ')' : 'No');
    
    const chatModelsDropdown = document.getElementById('chat-models');

    if (!chatModelsDropdown) {
      console.error('Chat models dropdown not found');
      return;
    }

    console.log('Clearing chat models dropdown');
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      console.log('Adding OpenAI models');
      addModelOptions(chatModelsDropdown, 'GPT Models', CHAT_MODELS.openai);
    }

    if (anthropicApiKey) {
      console.log('Adding Anthropic models');
      addModelOptions(chatModelsDropdown, 'Anthropic Models', CHAT_MODELS.anthropic);
    }

    if (!openaiApiKey && !anthropicApiKey) {
      console.log('No API keys found, adding no-key option');
      addNoApiKeyOption(chatModelsDropdown);
    }

    console.log('Chat models loaded successfully');
  } catch (error) {
    console.error('Error loading chat models:', error);
  }
  console.log('Exiting loadChatModels function');
}

// Add model options to dropdown
function addModelOptions(dropdown, label, models) {
  const group = document.createElement('optgroup');
  group.label = label;
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = option.textContent = model;
    group.appendChild(option);
  });
  dropdown.appendChild(group);
}

// Add no API key option to dropdown
function addNoApiKeyOption(dropdown) {
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'No API keys found. Please provide an OpenAI or Anthropic API key.';
  option.disabled = true;
  dropdown.appendChild(option);
}

// Initialize chat listeners
function initializeChatListeners() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');

  sendButton.addEventListener('click', function() {
    const message = chatInput.value.trim();
    if (message) {
      sendMessage(message);
      chatInput.value = '';
    }
  });

  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  chatInput.addEventListener('input', handleChatInput);
}

let mentionSuggestions = [];

async function handleChatInput(e) {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
        const mentionText = mentionMatch[1];
        const suggestions = await fetchMentionSuggestions(mentionText);
        displayMentionSuggestions(suggestions, input, cursorPosition);
    } else {
        hideMentionSuggestions();
    }
}

async function fetchMentionSuggestions(query) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    if (!apiKey || !endpoint) {
        console.error('Obsidian API key or endpoint not set');
        return [];
    }

    try {
        const response = await fetch(`${endpoint}/vault/`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.files
            .filter(file => file.toLowerCase().includes(query.toLowerCase()) && file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', ''),
                path: file
            }));
    } catch (error) {
        console.error('Error fetching mention suggestions:', error);
        return [];
    }
}

function displayMentionSuggestions(suggestions, input, cursorPosition) {
    const suggestionList = document.getElementById('mention-suggestions');
    if (!suggestionList) {
        const newSuggestionList = document.createElement('ul');
        newSuggestionList.id = 'mention-suggestions';
        newSuggestionList.style.position = 'absolute';
        newSuggestionList.style.zIndex = '1000';
        input.parentNode.appendChild(newSuggestionList);
    }

    const list = document.getElementById('mention-suggestions');
    list.innerHTML = '';
    mentionSuggestions = suggestions;

    suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.textContent = suggestion.name;
        li.addEventListener('click', () => selectMention(suggestion, input, cursorPosition));
        list.appendChild(li);
    });

    positionSuggestionList(list, input);
}

function positionSuggestionList(list, input) {
    const inputRect = input.getBoundingClientRect();
    list.style.top = `${inputRect.bottom}px`;
    list.style.left = `${inputRect.left}px`;
    list.style.width = `${inputRect.width}px`;
}

function hideMentionSuggestions() {
    const suggestionList = document.getElementById('mention-suggestions');
    if (suggestionList) {
        suggestionList.innerHTML = '';
    }
}

function selectMention(suggestion, input, cursorPosition) {
    const textBeforeMention = input.value.substring(0, cursorPosition).replace(/@\w*$/, '');
    const textAfterMention = input.value.substring(cursorPosition);
    input.value = `${textBeforeMention}@${suggestion.name} ${textAfterMention}`;
    hideMentionSuggestions();
    input.focus();
}

// Helper function to get API key
async function getApiKey(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(result) {
            console.log(`Retrieving ${key} from storage`);
            if (chrome.runtime.lastError) {
                console.error('Error retrieving API key:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                const encodedKey = result[key];
                console.log(`Encoded key found: ${encodedKey ? 'Yes' : 'No'}`);
                if (encodedKey) {
                    try {
                        const decodedKey = atob(encodedKey);
                        console.log(`API key for ${key} retrieved and decoded successfully`);
                        resolve(decodedKey); 
                    } catch (error) {
                        console.error('Error decoding API key:', error);
                        reject(error);
                    }
                } else {
                    console.warn(`No API key found for ${key}`);
                    resolve(null);
                }
            }
        });
    });
}

// Send a message to OpenAI
async function sendMessageToOpenAI(model, apiKey, messages) {
  try {
    console.log('Sending message to OpenAI API');
    console.log('Model:', model);
    console.log('Messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in sendMessageToOpenAI:', error);
    throw error;
  }
}

// Send a message to Anthropic
async function sendMessageToAnthropic(model, apiKey, messages) {
  try {
    console.log('Sending message to Anthropic API');
    console.log('Model:', model);
    console.log('Messages:', messages);

    let max_tokens;
    if (model === 'claude-3-5-sonnet-20240620') {
      max_tokens = 8192;
    } else {
      max_tokens = 4096; // For other Claude models
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        max_tokens: max_tokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API Error:', errorData);
      throw new Error(`Anthropic API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Anthropic API Response:', data);
    return data.content[0].text;
  } catch (error) {
    console.error('Error in sendMessageToAnthropic:', error);
    throw error;
  }
}

// Display assistant reply
function displayAssistantReply(reply) {
  addMessageToChat('assistant-message', reply);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize documents listeners
function initializeDocumentsListeners() {
  console.log('Initializing documents listeners');
  // Remove the code that tries to add an event listener to the load button
}

// Load sessions from storage
async function loadSessions() {
  console.log('Loading sessions');
  try {
    const result = await chrome.storage.local.get('sessions');
    sessions = result.sessions || {};
    console.log('Loaded sessions:', sessions);
    updateSessionList();
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

async function loadObsidianSessions() {
  console.log('Loading Obsidian sessions');
  try {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    console.log('Obsidian API Key:', apiKey ? 'Set' : 'Not set');
    console.log('Obsidian Endpoint:', endpoint);
    console.log('Obsidian Chat Path:', chatPath);

    if (!apiKey || !endpoint || !chatPath) {
      console.error('Obsidian settings are incomplete');
      return;
    }

    // Ensure the chatPath ends with a forward slash
    const formattedChatPath = chatPath.endsWith('/') ? chatPath : `${chatPath}/`;
    const url = `${endpoint.replace(/\/$/, '')}/vault/${formattedChatPath.replace(/^\//, '')}`;
    console.log('Fetching Obsidian sessions from:', url);

    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Obsidian API response:', data);

    if (!data.files || !Array.isArray(data.files)) {
      console.error('Unexpected response format:', data);
      throw new Error('Unexpected response format from Obsidian API');
    }

    sessions = {};
    for (const file of data.files) {
      if (file.endsWith('.md')) {
        const sessionId = file.replace('.md', '');
        sessions[sessionId] = { id: sessionId, name: file };
      }
    }
    console.log('Loaded Obsidian sessions:', sessions);
    updateSessionList();
  } catch (error) {
    console.error('Error loading Obsidian sessions:', error);
  }
}

// Update the session list in the UI
function updateSessionList() {
  console.log('Updating session list');
  const sessionDropdown = document.getElementById('saved-sessions');
  sessionDropdown.innerHTML = '<option value="">Select a session</option>';
  
  Object.values(sessions).forEach(session => {
    const option = document.createElement('option');
    option.value = session.id;
    option.textContent = session.name || `Session ${session.id}`;
    sessionDropdown.appendChild(option);
  });
  
  console.log('Session list updated');
}

// Load a specific session
async function loadSession(sessionId) {
  console.log(`Loading session: ${sessionId}`);
  const session = sessions[sessionId];
  if (session) {
    try {
      const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
      
      if (saveToObsidian) {
        await loadObsidianSessionContent(session);
      } else {
        await loadGoogleDriveSessionContent(session);
      }

      currentSession = session;
      
      // Update the chat model dropdown
      const chatModelsDropdown = document.getElementById('chat-models');
      if (chatModelsDropdown) {
        chatModelsDropdown.value = session.model || '';
      }
      
      // Update the session dropdown to reflect the loaded session
      const sessionDropdown = document.getElementById('saved-sessions');
      if (sessionDropdown) {
        sessionDropdown.value = sessionId;
      }

      // Update session name input field
      const sessionNameInput = document.getElementById('session-name-input');
      if (sessionNameInput) {
        sessionNameInput.value = session.name;
      }

      // Explicitly update the chat session UI
      updateChatSession();

    } catch (error) {
      console.error('Error loading session content:', error);
      alert(`Failed to load session: ${error.message}`);
      // Reset the session dropdown
      const sessionDropdown = document.getElementById('saved-sessions');
      if (sessionDropdown) {
        sessionDropdown.value = '';
      }
    }
  } else {
    console.error('Session not found:', sessionId);
  }
}

async function loadObsidianSessionContent(session) {
  const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
  const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
  const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

  const url = `${endpoint.replace(/\/$/, '')}/vault/${chatPath.replace(/^\//, '')}/${session.name}`;
  console.log('Loading Obsidian session from:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    session.messages = parseMarkdownToMessages(content);
    session.model = extractModelFromMarkdown(content);

    // Update the UI
    updateChatSession();
    
    console.log('Session loaded:', session);
    return content;
  } catch (error) {
    console.error('Error loading Obsidian session content:', error);
    alert(`Failed to load session content: ${error.message}`);
    throw error;
  }
}

async function loadGoogleDriveSessionContent(session) {
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${session.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const content = await response.text();
  session.messages = parseMarkdownToMessages(content);
  session.model = extractModelFromMarkdown(content);
}

function parseMarkdownToMessages(markdown) {
  const lines = markdown.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    if (line.startsWith('## User') || line.startsWith('## USER') || 
        line.startsWith('## Assistant') || line.startsWith('## ASSISTANT')) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = {
        role: line.toUpperCase().includes('USER') ? 'user' : 'assistant',
        content: ''
      };
    } else if (currentMessage) {
      currentMessage.content += line + '\n';
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages.map(msg => ({
    ...msg,
    content: msg.content.trim()
  }));
}

function extractModelFromMarkdown(markdown) {
  const modelLine = markdown.split('\n').find(line => line.startsWith('Model:'));
  return modelLine ? modelLine.split(':')[1].trim() : null;
}

// Update the chat session in the UI
function updateChatSession() {
  console.log('Updating chat session');
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = '';
  if (currentSession && currentSession.messages) {
    currentSession.messages.forEach(msg => {
      addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', msg.content);
    });
  } else {
    console.warn('No messages in current session');
  }
}

// Add a message to the chat UI
function addMessageToChat(className, message) {
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${className}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
  } else {
    console.error('Chat messages container not found');
    return null;
  }
}

// Initialize the Mentus Tab when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded and parsed");
  initializeMentusTab();
});

// Initialize session listeners
function initializeSessionListeners() {
  console.log('Initializing session listeners');
  const saveSessionButton = document.getElementById('save-session-button');
  if (saveSessionButton) {
    saveSessionButton.addEventListener('click', saveCurrentSession);
  }

  const newSessionButton = document.getElementById('new-session-button');
  if (newSessionButton) {
    newSessionButton.addEventListener('click', startNewSession);
  }

  const chatModelsDropdown = document.getElementById('chat-models');
  if (chatModelsDropdown) {
    chatModelsDropdown.addEventListener('change', handleModelChange);
  }

  const savedSessionsDropdown = document.getElementById('saved-sessions');
  if (savedSessionsDropdown) {
    savedSessionsDropdown.addEventListener('change', handleSessionChange);
  }

  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    sessionNameInput.addEventListener('change', saveCurrentSession);
  }
}

// Add this function to handle dark mode toggle
function initializeDarkModeToggle() {
    console.log('Initializing dark mode toggle');
    const toggleButton = document.getElementById('toggle-dark-mode');
    if (!toggleButton) {
        console.error('Dark mode toggle button not found');
        return;
    }

    toggleButton.addEventListener('click', () => {
        console.log('Dark mode toggle clicked');
        chrome.storage.local.get(['darkMode'], function(result) {
            const newDarkMode = !result.darkMode;
            chrome.storage.local.set({ 'darkMode': newDarkMode }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving dark mode preference:', chrome.runtime.lastError);
                } else {
                    console.log('Dark mode preference saved:', newDarkMode);
                    applyDarkMode(newDarkMode);
                }
            });
        });
    });

    // Apply initial dark mode state
    chrome.storage.local.get(['darkMode'], function(result) {
        console.log('Retrieved dark mode preference:', result.darkMode);
        applyDarkMode(result.darkMode);
    });
}

// Add this new function to apply dark mode
function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateDarkModeButtonText(isDarkMode);
}

// Modify the updateDarkModeButtonText function
function updateDarkModeButtonText(isDarkMode) {
    const toggleButton = document.getElementById('toggle-dark-mode');
    if (toggleButton) {
        toggleButton.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        toggleButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        console.log('Updated dark mode button text:', toggleButton.textContent);
    } else {
        console.error('Dark mode toggle button not found in updateDarkModeButtonText');
    }
}

// Start a new session
function startNewSession() {
  console.log('Starting new session');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
  const sessionName = `New_Chat_${timestamp}`;
  currentSession = {
    id: Date.now().toString(),
    messages: [],
    model: null,
    name: sessionName
  };
  sessions[currentSession.id] = currentSession;
  updateSessionList();
  updateChatSession();

  // Update the session name input
  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    sessionNameInput.value = sessionName;
  }
}

// Save the current session
async function saveCurrentSession() {
  console.log('Saving current session');
  if (!currentSession.id) {
    console.warn('No current session to save, creating a new one');
    startNewSession();
    return;
  }

  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    // Sanitize the session name by replacing spaces with underscores
    currentSession.name = sessionNameInput.value.trim().replace(/\s+/g, '_');
    sessionNameInput.value = currentSession.name; // Update the input to reflect the sanitized name
  }

  // Create markdown content
  const markdownContent = createMarkdownFromSession(currentSession);

  // Check if we should save to Obsidian
  const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
  if (saveToObsidian) {
    await saveToObsidianVault(markdownContent);
  } else {
    await saveToGoogleDrive(markdownContent);
  }

  // Update local storage
  sessions[currentSession.id] = currentSession;
  await saveSessions();
  updateSessionList();
}

// Helper function to create markdown content from a session
function createMarkdownFromSession(session) {
  let markdown = `# Chat Session: ${session.name || 'Untitled Session'}\n\n`;
  markdown += `Model: ${session.model}\n\n`;
  session.messages.forEach(msg => {
    markdown += `## ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n${msg.content}\n\n`;
  });
  return markdown;
}

// Save all sessions to storage
async function saveSessions() {
  console.log('Saving all sessions');
  if (!chrome.storage) {
    console.error('Chrome storage API not available');
    return;
  }

  try {
    await chrome.storage.local.set({ chatSessions: Object.values(sessions) });
    console.log('Sessions saved successfully');
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Handle model change
function handleModelChange(event) {
  console.log('Model changed:', event.target.value);
  if (!currentSession.id) {
    console.warn('No current session, creating a new one');
    startNewSession();
  }
  currentSession.model = event.target.value;
  saveCurrentSession();
}

// Handle session change
function handleSessionChange(event) {
  console.log('Session changed:', event.target.value);
  loadSession(event.target.value);
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message === '') return;

    input.value = '';
    addMessageToChat('user-message', message);

    const model = document.getElementById('chat-models').value;
    if (!model) {
        alert('Please select a model');
        return;
    }

    currentSession.messages.push({ role: 'user', content: message });
    currentSession.model = model;

    try {
        let apiKey;
        if (model.includes('gpt')) {
            apiKey = await window.settingsModule.getSetting('openai-api-key');
        } else if (model.startsWith('claude')) {
            apiKey = await window.settingsModule.getSetting('anthropic-api-key');
        }

        if (!apiKey) {
            throw new Error('API key not found. Please check your settings.');
        }

        // Add a small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Sending message to model:', model);
        console.log('API Key (first 4 characters):', apiKey.substring(0, 4));
        console.log('Messages:', currentSession.messages);

        let response;
        if (model.includes('gpt')) {
            response = await sendMessageToOpenAI(model, apiKey, currentSession.messages);
        } else if (model.startsWith('claude')) {
            response = await sendMessageToAnthropic(model, apiKey, currentSession.messages);
        }

        addMessageToChat('assistant-message', response);
        currentSession.messages.push({ role: 'assistant', content: response });
        saveCurrentSession();
    } catch (error) {
        console.error('Error sending message:', error);
        alert(`Error sending message: ${error.message}`);
    }
}

async function saveToObsidianVault(content) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    if (!apiKey || !endpoint || !chatPath) {
        console.error('Obsidian settings are not complete');
        console.log('API Key:', apiKey ? 'Set' : 'Not set');
        console.log('Endpoint:', endpoint);
        console.log('Chat Path:', chatPath);
        alert('Obsidian settings are not complete. Please check your settings.');
        return;
    }

    const sanitizedSessionName = `chat_session_${(currentSession.name || 'Untitled_Session').replace(/\s+/g, '_')}`;
    const fileName = `${sanitizedSessionName}.md`;
    const filePath = `${chatPath.replace(/\/$/, '')}/${fileName}`;

    console.log('Saving to Obsidian:', filePath);
    console.log('Content length:', content.length);

    try {
        const url = `${endpoint.replace(/\/$/, '')}/vault/${filePath.replace(/^\//, '')}`;
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

        console.log('Session saved to Obsidian file');
    } catch (error) {
        console.error('Error saving session to Obsidian:', error);
        alert(`Failed to save the session to Obsidian. Error: ${error.message}\nPlease check your settings and try again.`);
    }
}

function initializeChatListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    chatInput.addEventListener('input', handleChatInput);
}
