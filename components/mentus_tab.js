// Constants for settings and chat models
const SETTINGS = [
  'openai-api-key',
  'anthropic-api-key',
  'graphdb-endpoint',
  'graphdb-creds',
  'local-storage-location'
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
    initializeTabButtons();
    loadSessions();
    loadChatModels();
    initializeChatListeners();
    initializeSettingsListeners();
    initializeProfileListeners();
    loadUserProfileContent(() => {
      profileDataReady = true;
      // Any other initialization that depends on profile data
    });
    
    // Set up event listeners for session management
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
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

// Handle chat model change
function handleModelChange(event) {
  const newModel = event.target.value;
  currentSession.model = newModel;
  console.log(`Model changed to: ${newModel}`);
}

// Handle session change
function handleSessionChange(event) {
  const sessionId = event.target.value;
  if (sessionId) {
    loadSession(sessionId);
  } else {
    startNewSession();
  }
}

// Save the current session
async function saveCurrentSession() {
  if (!currentSession.id) return;

  const sessionNameInput = document.getElementById('session-name-input');
  currentSession.name = sessionNameInput ? sessionNameInput.value : '';

  sessions[currentSession.id] = {
    id: currentSession.id,
    name: currentSession.name,
    model: currentSession.model,
    messages: currentSession.messages
  };

  try {
    await saveSessions();
    updateSessionList();
  } catch (error) {
    console.error('Error saving current session:', error);
  }
}

// Save all sessions to storage
async function saveSessions() {
  if (!chrome.storage) {
    console.error('Chrome storage API not available');
    return;
  }

  try {
    const sessionsToSave = [currentSession, ...Object.values(sessions)];
    const recentSessions = sessionsToSave
      .filter(session => session.messages.length > 0)
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 1000)
      .map(session => ({
        id: session.id,
        model: session.model,
        messages: session.messages,
        name: session.name
      }));
    
    await chrome.storage.local.set({ chatSessions: recentSessions });
    sessions = recentSessions.reduce((acc, session) => {
      acc[session.id] = session;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Load sessions from storage
async function loadSessions() {
  if (!chrome.storage) {
    console.error('Chrome storage API not available');
    return;
  }

  try {
    const result = await chrome.storage.local.get(['chatSessions']);
    const loadedSessions = result.chatSessions || [];
    sessions = loadedSessions.reduce((acc, session) => {
      acc[session.id] = session;
      return acc;
    }, {});
    updateSessionList();
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

// Update the session list in the UI
function updateSessionList() {
  const sessionList = document.getElementById('session-list');
  const sessionDropdown = document.getElementById('saved-sessions');
  
  if (sessionList) sessionList.innerHTML = '';
  if (sessionDropdown) sessionDropdown.innerHTML = '<option value="">Select a session</option>';

  Object.entries(sessions).forEach(([id, session]) => {
    const sessionName = session.name || `Session ${id}`;
    
    if (sessionList) {
      const li = document.createElement('li');
      li.textContent = sessionName;
      li.onclick = () => loadSession(id);
      sessionList.appendChild(li);
    }
    
    if (sessionDropdown) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = sessionName;
      sessionDropdown.appendChild(option);
    }
  });

  // Set the current session in the dropdown
  if (currentSession.id) {
    sessionDropdown.value = currentSession.id;
  }
}

// Load a specific session
function loadSession(sessionId) {
  const session = sessions[sessionId];
  if (session) {
    currentSession = session;
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
      sessionNameInput.value = session.name || `Session ${sessionId}`;
    }

    // Update session name display
    const sessionNameDisplay = document.getElementById('session-name-display');
    if (sessionNameDisplay) {
      sessionNameDisplay.textContent = session.name || `Session ${sessionId}`;
    }
  }
}

// Start a new session
function startNewSession() {
  currentSession = { id: null, messages: [], model: null };
  const chatModelsDropdown = document.getElementById('chat-models');
  if (chatModelsDropdown) {
    chatModelsDropdown.selectedIndex = 0;
  }
  updateChatSession();

  // Reset the session dropdown
  const sessionDropdown = document.getElementById('saved-sessions');
  if (sessionDropdown) {
    sessionDropdown.selectedIndex = 0;
  }
}

// Update the chat session in the UI
function updateChatSession() {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = '';
  currentSession.messages.forEach(msg => {
    addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', msg.content);
  });

  // Update session name display
  const sessionNameDisplay = document.getElementById('session-name-display');
  if (sessionNameDisplay) {
    sessionNameDisplay.textContent = currentSession.name || `Session ${currentSession.id}`;
  }
}

// Initialize tab buttons
function initializeTabButtons() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (event) => showTab(event.target.getAttribute('data-tab')));
  });
}

// Show a specific tab
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.classList.add('active');
    if (tabName === 'settings') {
      loadSettingsContent();
    } else if (tabName === 'userprofile') {
      loadUserProfileContent();
    }
  }
}

// Update the loadSettingsContent function
function initializeSettingsListeners() {
  // Load existing settings
  loadExistingSettings();
  
  // Add event listener for saving settings
  document.getElementById('save-settings').addEventListener('click', saveSettings);
}

// Load existing settings
async function loadExistingSettings() {
  const result = await chrome.storage.local.get(SETTINGS);
  SETTINGS.forEach(setting => {
    const input = document.getElementById(setting);
    if (input) {
      input.value = result[setting] ? atob(result[setting]) : '';
    }
  });
}

// Save settings
async function saveSettings() {
  const settingsToSave = {};
  SETTINGS.forEach(setting => {
    const input = document.getElementById(setting);
    if (input && input.value) {
      settingsToSave[setting] = btoa(input.value);
    }
  });

  try {
    await chrome.storage.local.set(settingsToSave);
    alert('Settings saved successfully!');
    loadChatModels(); // Reload chat models after saving settings
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Error saving settings. Please try again.');
  }
}

// Initialize profile listeners
function initializeProfileListeners() {
  const saveProfileButton = document.getElementById('save-profile');
  if (saveProfileButton) {
    saveProfileButton.addEventListener('click', saveProfile);
  }

  const googleAuthButton = document.getElementById('google-auth-button');
  if (googleAuthButton) {
    googleAuthButton.addEventListener('click', initiateGoogleSignIn);
  }
}

// Load user profile content
function loadUserProfileContent(callback) {
  chrome.storage.local.get(['userProfile', 'userInfo'], function(result) {
    const userProfile = result.userProfile || {};
    const userInfo = result.userInfo || {};
    
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const googleAccountDisplay = document.getElementById('google-account-display');
    
    if (usernameElement) {
      usernameElement.value = userProfile.username || '';
    }
    if (emailElement) {
      emailElement.value = userProfile.email || '';
    }
    if (googleAccountDisplay) {
      googleAccountDisplay.textContent = userInfo.email || 'Not connected';
    }

    if (typeof callback === 'function') {
      callback();
    }
  });
}

function initiateGoogleSignIn() {
  chrome.runtime.sendMessage({action: "authenticate"}, function(response) {
    if (response.success) {
      console.log('Authentication successful');
      // Reload user profile content after successful sign-in
      loadUserProfileContent();
    } else {
      console.error('Authentication failed:', response.error);
    }
  });
}

// Save profile
function saveProfile() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;

  chrome.storage.local.set({ userProfile: { username, email } }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error saving profile:', chrome.runtime.lastError);
      alert('Failed to save profile. Please try again.');
    } else {
      alert('Profile saved successfully!');
    }
  });
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

// Send a message
async function sendMessage(message) {
  const selectedModel = document.getElementById('chat-models').value;
  const apiKey = await getApiKey(selectedModel.includes('gpt') ? 'openai-api-key' : 'anthropic-api-key');

  if (!apiKey || !selectedModel) {
    displayAssistantReply('Error: API key is missing or invalid, or no model selected.');
    return;
  }

  try {
    if (!currentSession.id || sessions[currentSession.id].model !== selectedModel) {
      currentSession.id = Date.now().toString();
      currentSession.model = selectedModel;
      currentSession.messages = [];
      sessions[currentSession.id] = currentSession;
    }

    addMessageToChat('user-message', message);
    currentSession.messages.push({ role: 'user', content: message });
    
    const response = await (selectedModel.includes('gpt') ? sendMessageToOpenAI : sendMessageToAnthropic)(selectedModel, apiKey, currentSession.messages);
    addMessageToChat('assistant-message', response);
    
    currentSession.messages.push({ role: 'assistant', content: response });
    
    await saveCurrentSession();
    updateSessionList();
  } catch (error) {
    console.error('Error:', error);
    addMessageToChat('assistant-message', `Error: ${error.message}`);
  }
}

// Add this function to display messages in the chat history
function addMessageToChat(className, message) {
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${className}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    console.error('Chat messages container not found');
  }
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

// Get API key
async function getApiKey(key) {
  const { [key]: encodedKey } = await chrome.storage.local.get(key);
  if (!encodedKey) return null;
  try {
    return atob(encodedKey);
  } catch (error) {
    console.error('Error decoding API key:', error);
    return null;
  }
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize the Mentus Tab when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeMentusTab);