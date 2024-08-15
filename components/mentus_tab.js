// Constants
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

const MAX_CONTEXT_MESSAGES = 50;
const MAX_SAVED_SESSIONS = 10;

let sessions = {};
let currentSessionId = null;

function initializeMentusTab() {
  try {
    initializeTabButtons();
    loadSettings();
    showTab('settings');
    loadChatModels();
    loadSessions();
    loadUserProfile();
    initializeChatListeners();
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

function initializeTabButtons() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (event) => showTab(event.target.getAttribute('data-tab')));
  });
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.classList.add('active');
    if (tabName === 'settings') {
      loadSettingsContent();
    }
  }
}

function loadSettingsContent() {
  loadSettings();
  SETTINGS.forEach(setting => {
    const inputElement = document.getElementById(setting);
    if (inputElement) {
      inputElement.addEventListener('input', debounce(() => saveSetting(setting, inputElement.value), 500));
    }
  });
}

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(SETTINGS);
    SETTINGS.forEach(setting => updateSettingDisplay(setting, result[setting] || ''));
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function updateSettingDisplay(setting, value) {
  const inputElement = document.getElementById(setting);
  const displayElement = document.getElementById(`${setting}-display`);
  
  if (!inputElement || !displayElement) {
    console.error(`Element not found for setting: ${setting}`);
    return;
  }

  if (setting.includes('api-key') && value) {
    try {
      const decodedValue = atob(value);
      inputElement.value = '';
      displayElement.textContent = `${decodedValue.substring(0, 4)}${'*'.repeat(Math.max(0, decodedValue.length - 4))}`;
    } catch (e) {
      console.error('Error processing API key:', e);
      displayElement.textContent = 'Error: Invalid API key';
    }
  } else {
    inputElement.value = value;
    displayElement.textContent = value || 'No value set';
  }
}

async function saveSetting(setting, value) {
  try {
    let storedValue = value;
    if (setting.includes('api-key')) {
      storedValue = btoa(value);
    }
    const updatedSetting = { [setting]: storedValue };
    await chrome.storage.local.set(updatedSetting);
    console.log(`${setting} saved successfully.`);
    await loadSettings();
    if (setting.includes('api-key')) {
      loadChatModels();
    }
  } catch (error) {
    console.error(`Error saving setting ${setting}:`, error);
  }
}

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

function addNoApiKeyOption(dropdown) {
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'No API keys found. Please provide an OpenAI or Anthropic API key.';
  option.disabled = true;
  dropdown.appendChild(option);
}

// Chat-specific functionality
function initializeChatListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const saveSessionButton = document.getElementById('save-session-button');
    const newSessionButton = document.getElementById('new-session-button');

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

async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatModels = document.getElementById('chat-models');
    const message = chatInput.value.trim();
    const selectedModel = chatModels.value;

    if (message && selectedModel) {
        addMessageToChat('user-message', message);
        chatInput.value = '';

        try {
            const response = await callChatAPI(selectedModel, message);
            addMessageToChat('assistant-message', response);
        } catch (error) {
            console.error('Error calling chat API:', error);
            addMessageToChat('error-message', 'An error occurred while processing your request.');
        }
    } else if (!selectedModel) {
        alert('Please select a chat model before sending a message.');
    }
}

async function callChatAPI(model, message) {
    // Implement the API call based on the selected model
    // This is a placeholder implementation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Response from ${model}: ${message}`);
        }, 1000);
    });
}

function addMessageToChat(className, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${className}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveSession() {
    // Implementation for saving the current session
    console.log('Saving session...');
}

function startNewSession() {
    // Implementation for starting a new session
    console.log('Starting new session...');
}

function loadUserProfile() {
  chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'openaiApiKey', 'anthropicApiKey'], data => {
    console.log('User profile loaded:', data);
  });
}

// Chat-specific functionality has been moved to components/chat/chat.js

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener("DOMContentLoaded", initializeMentusTab);
