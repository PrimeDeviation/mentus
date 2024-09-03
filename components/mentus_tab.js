// Constants for settings and chat models
const SETTINGS = [
  'openai-api-key',
  'anthropic-api-key'
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
function initializeMentusTab() {
  try {
    console.log('Initializing Mentus Tab');
    initializeTabButtons();
    loadSessions(); // Load sessions from Google Drive
    loadChatModels();
    initializeChatListeners();
    initializeSettingsListeners();
    initializeDocumentsListeners();
    initializeSessionListeners();
    loadExistingSettings();

    // Create a new session if one doesn't exist
    if (!currentSession.id) {
      startNewSession();
    }

    console.log('About to show settings tab');
    showTab('settings'); // Show settings tab by default
    console.log('Mentus Tab initialization complete');
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

// Initialize tab buttons
function initializeTabButtons() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const tabName = event.target.getAttribute('data-tab');
      showTab(tabName);
    });
  });
}

// Show a specific tab
function showTab(tabName) {
  console.log(`Showing tab: ${tabName}`);
  
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  const activeTab = document.getElementById(tabName);
  const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
  
  if (activeTab && activeButton) {
    activeTab.style.display = 'block';
    activeButton.classList.add('active');
    console.log(`Tab ${tabName} is now visible`);

    if (tabName === 'docs') {
      console.log('Initializing documents for docs tab');
      if (typeof window.showDocumentsTab === 'function') {
        window.showDocumentsTab();
      } else {
        console.error('showDocumentsTab function not found');
      }
    } else if (tabName === 'editor') {
      console.log('Initializing editor for editor tab');
      if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.ensureEditorInitialized === 'function') {
        window.editorModule.ensureEditorInitialized();
      } else {
        console.error('Editor module not found');
      }
    }
  } else {
    console.error(`Tab content or button not found for: ${tabName}`);
  }
}

// Initialize settings listeners
function initializeSettingsListeners() {
  console.log('Initializing settings listeners');
  SETTINGS.forEach(setting => {
    const input = document.getElementById(setting);
    if (input) {
      input.addEventListener('input', function() {
        updateApiKeyDisplay(setting, input.value);
      });
      input.addEventListener('keyup', debounce(function(event) {
        if (event.key === 'Enter') {
          saveSetting(setting, input.value);
        }
      }, 300));
      input.addEventListener('blur', function() {
        saveSetting(setting, input.value);
      });
    } else {
      console.error(`Setting input not found: ${setting}`);
    }
  });
}

// Load existing settings
async function loadExistingSettings() {
  console.log('Loading existing settings');
  const result = await chrome.storage.local.get(SETTINGS);
  SETTINGS.forEach(setting => {
    const input = document.getElementById(setting);
    if (input) {
      const value = result[setting] ? atob(result[setting]) : '';
      input.value = value;
      updateApiKeyDisplay(setting, value);
    } else {
      console.error(`Setting input not found: ${setting}`);
    }
  });
}

// Save a single setting
async function saveSetting(setting, value) {
  console.log(`Saving setting: ${setting}`);
  const settingToSave = {};
  settingToSave[setting] = value ? btoa(value) : '';

  try {
    await chrome.storage.local.set(settingToSave);
    updateApiKeyDisplay(setting, value);
    loadChatModels(); // Reload chat models after saving settings
  } catch (error) {
    console.error(`Error saving setting ${setting}:`, error);
  }
}

// Update API key display
function updateApiKeyDisplay(setting, value) {
  const display = document.getElementById(`${setting}-display`);
  if (display) {
    if (value) {
      const obfuscatedValue = value.substring(0, 4) + '*'.repeat(Math.max(0, value.length - 4));
      display.textContent = obfuscatedValue;
    } else {
      display.textContent = 'No API key set';
    }
  } else {
    console.warn(`Display element for ${setting} not found`);
  }
}

// Load chat models
async function loadChatModels() {
  try {
    const result = await chrome.storage.local.get(['openai-api-key', 'anthropic-api-key']);
    const openaiApiKey = result['openai-api-key'];
    const anthropicApiKey = result['anthropic-api-key'];
    const chatModelsDropdown = document.getElementById('chat-models');

    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      addModelOptions(chatModelsDropdown, 'GPT Models', CHAT_MODELS.openai);
    }

    if (anthropicApiKey) {
      addModelOptions(chatModelsDropdown, 'Anthropic Models', CHAT_MODELS.anthropic);
    }

    if (!openaiApiKey && !anthropicApiKey) {
      addNoApiKeyOption(chatModelsDropdown);
    }
  } catch (error) {
    console.error('Error loading chat models:', error);
  }
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
}

// Helper function to get API key
async function getApiKey(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], function(result) {
            console.log(`Retrieving ${key} from storage`);
            if (chrome.runtime.lastError) {
                console.error('Error retrieving API key:', chrome.runtime.lastError);
                resolve(null);
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
                        resolve(null);
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
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message);
  }

  const data = await response.json();
  console.log('OpenAI API Response:', data);
  return data.choices[0].message.content;
}

// Send a message to Anthropic
async function sendMessageToAnthropic(model, apiKey, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, messages, max_tokens: 4000 })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API Error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log('Anthropic API Response:', data);
  return data.content[0].text;
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
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    const result = await new Promise((resolve) => {
      chrome.storage.local.get(['mentusFolderId'], resolve);
    });

    if (!result.mentusFolderId) {
      console.error('Mentus folder not initialized');
      return;
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${result.mentusFolderId}' in parents and mimeType='text/markdown'&fields=files(id,name,modifiedTime)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    sessions = {};
    data.files.forEach(file => {
      // Use the file ID as the key to prevent duplicates
      sessions[file.id] = { 
        id: file.id, 
        name: file.name.replace('.md', ''), 
        modifiedTime: file.modifiedTime,
        messages: [] // We'll load messages when the session is selected
      };
    });

    updateSessionList();
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

// Update the session list in the UI
function updateSessionList() {
  console.log('Updating session list');
  const sessionDropdown = document.getElementById('saved-sessions');
  
  if (sessionDropdown) {
    sessionDropdown.innerHTML = '<option value="">Select a session</option>';

    // Sort sessions by modified time, most recent first
    const sortedSessions = Object.values(sessions).sort((a, b) => 
      new Date(b.modifiedTime) - new Date(a.modifiedTime)
    );

    sortedSessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = session.name;
      sessionDropdown.appendChild(option);
    });

    // Set the current session in the dropdown
    if (currentSession.id) {
      sessionDropdown.value = currentSession.id;
    }
  }
}

// Load a specific session
async function loadSession(sessionId) {
  console.log(`Loading session: ${sessionId}`);
  const session = sessions[sessionId];
  if (session) {
    try {
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${sessionId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      session.messages = parseMarkdownToMessages(content);
      session.model = extractModelFromMarkdown(content);

      currentSession = session;
      currentSession.fileId = sessionId; // Store the file ID
      updateChatSession();
      
      // Update the chat model dropdown
      const chatModelsDropdown = document.getElementById('chat-models');
      if (chatModelsDropdown) {
        chatModelsDropdown.value = session.model;
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
    } catch (error) {
      console.error('Error loading session content:', error);
    }
  }
}

function parseMarkdownToMessages(markdown) {
  const lines = markdown.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    if (line.startsWith('## User') || line.startsWith('## Assistant')) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = {
        role: line.startsWith('## User') ? 'user' : 'assistant',
        content: ''
      };
    } else if (currentMessage) {
      currentMessage.content += line + '\n';
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
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
  currentSession.messages.forEach(msg => {
    addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', msg.content);
  });
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

// Start a new session
function startNewSession() {
  console.log('Starting new session');
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:mm:ss
  currentSession = {
    id: Date.now().toString(),
    messages: [],
    model: null,
    name: `New Chat- ${timestamp}`
  };
  sessions[currentSession.id] = currentSession;
  updateSessionList();
  updateChatSession();

  // Update the session name input
  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    sessionNameInput.value = currentSession.name;
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
    const newSessionName = sessionNameInput.value.trim();
    
    // Check for existing session with the same name, excluding the current session
    const existingSession = Object.values(sessions).find(session => session.name === newSessionName && session.id !== currentSession.id);
    if (existingSession) {
      alert('A session with this name already exists. Please choose a different name.');
      return;
    }

    currentSession.name = newSessionName;
  }

  // Create markdown content
  const markdownContent = createMarkdownFromSession(currentSession);

  // Save to Google Drive
  try {
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    // Ensure the fileName always has the .md extension
    const fileName = `${currentSession.name || 'Untitled Session'}${currentSession.name.endsWith('.md') ? '' : '.md'}`;
    let file;
    if (currentSession.fileId) {
      // Update existing file
      file = await updateMarkdownFile(token, currentSession.fileId, fileName, markdownContent);
    } else {
      // Create new file
      file = await window.createMarkdownFile(token, fileName, markdownContent);
      currentSession.fileId = file.id;
    }
    console.log('Session saved as markdown in Google Drive');

    // Update local storage
    sessions[currentSession.id] = currentSession;
    await saveSessions();
    updateSessionList();

    // Refresh the documents list
    if (typeof window.initializeDocuments === 'function') {
      window.initializeDocuments();
    }
  } catch (error) {
    console.error('Error saving session to Google Drive:', error);
    alert('Failed to save the session. Please try again.');
  }
}

// Add this new function to update existing files
async function updateMarkdownFile(token, fileId, fileName, content) {
  const metadata = {
    name: fileName,
    mimeType: 'text/markdown'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'text/markdown' }));

  const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  return response.json();
}

// Helper function to create markdown content from a session
function createMarkdownFromSession(session) {
  let markdown = `# ${session.name || 'Untitled Session'}\n\n`;
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
            apiKey = await getApiKey('openai-api-key');
        } else if (model.startsWith('claude')) {
            apiKey = await getApiKey('anthropic-api-key');
        }

        if (!apiKey) {
            alert('API key not found. Please check your settings.');
            return;
        }

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
        alert('Error sending message. Please try again.');
    }
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
            apiKey = await getApiKey('openai-api-key');
        } else if (model.startsWith('claude')) {
            apiKey = await getApiKey('anthropic-api-key');
        }

        if (!apiKey) {
            alert('API key not found. Please check your settings.');
            return;
        }

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
        alert('Error sending message. Please try again.');
    }
}

// ... (rest of the code remains unchanged)

