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
    window.chatMessages = document.getElementById('chat-messages');
    loadSessions();
    loadUserProfile();
    initializeChatListeners();
    
    const newSessionButton = document.getElementById('new-session-button');
    if (newSessionButton) {
      newSessionButton.addEventListener('click', startNewSession);
    }
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

async function sendMessage(message) {
  const selectedModel = document.getElementById('chat-models').value;
  const apiKey = await getApiKey(selectedModel.includes('gpt') ? 'openai-api-key' : 'anthropic-api-key');

  if (!apiKey || !selectedModel) {
    displayAssistantReply('Error: API key is missing or invalid, or no model selected.');
    return;
  }

  try {
    if (!currentSessionId || sessions[currentSessionId].model !== selectedModel) {
      currentSessionId = Date.now().toString();
      sessions[currentSessionId] = {
        model: selectedModel,
        messages: []
      };
    }

    addMessageToChat('user-message', message);
    sessions[currentSessionId].messages.push({ role: 'user', content: message });
    
    if (sessions[currentSessionId].messages.length > MAX_CONTEXT_MESSAGES) {
      sessions[currentSessionId].messages = sessions[currentSessionId].messages.slice(-MAX_CONTEXT_MESSAGES);
    }

    const response = await (selectedModel.includes('gpt') ? sendMessageToOpenAI : sendMessageToAnthropic)(selectedModel, apiKey, sessions[currentSessionId].messages);
    displayAssistantReply(response);
    
    sessions[currentSessionId].messages.push({ role: 'assistant', content: response });
    
    await saveSessions();
    updateSessionList();
  } catch (error) {
    console.error('Error:', error);
    displayAssistantReply(`Error: ${error.message}`);
  }
}

function addMessageToChat(className, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${className}`;
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

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

function displayAssistantReply(reply) {
  addMessageToChat('assistant-message', reply);
  saveChatSession();
}

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

function loadUserProfile() {
  chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'openaiApiKey', 'anthropicApiKey'], data => {
    console.log('User profile loaded:', data);
  });
}

async function saveSessions() {
  const sessionsArray = Object.entries(sessions).map(([id, session]) => ({
    id,
    model: session.model,
    messages: session.messages
  }));
  
  const recentSessions = sessionsArray.sort((a, b) => b.id - a.id).slice(0, MAX_SAVED_SESSIONS);
  
  await chrome.storage.local.set({ chatSessions: recentSessions });
}

async function loadSessions() {
  const result = await chrome.storage.local.get(['chatSessions']);
  const loadedSessions = result.chatSessions || [];
  sessions = loadedSessions.reduce((acc, session) => {
    acc[session.id] = { model: session.model, messages: session.messages };
    return acc;
  }, {});
  updateSessionList();
}

function updateSessionList() {
  const sessionList = document.getElementById('session-list');
  if (!sessionList) return;

  sessionList.innerHTML = '';
  Object.entries(sessions).forEach(([id, session]) => {
    const li = document.createElement('li');
    li.textContent = `${session.model} - ${new Date(parseInt(id)).toLocaleString()}`;
    li.onclick = () => loadSession(id);
    sessionList.appendChild(li);
  });
}

function loadSession(sessionId) {
  currentSessionId = sessionId;
  const session = sessions[sessionId];
  document.getElementById('chat-models').value = session.model;
  
  window.chatMessages.innerHTML = '';
  
  session.messages.forEach(msg => {
    addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', msg.content);
  });
}

function startNewSession() {
  currentSessionId = null;
  document.getElementById('chat-models').selectedIndex = 0;
  window.chatMessages.innerHTML = '';
}

function saveChatSession() {
  console.log('Saving chat session...');
  // Implementation for saving chat session
}

function displaySavedChatSessions() {
  console.log('Saved Chat Sessions:');
  Object.entries(sessions).forEach(([id, session]) => {
    console.log(`Session ${id}:`);
    console.log(`  Model: ${session.model}`);
    console.log(`  Messages: ${session.messages.length}`);
    session.messages.forEach((msg, index) => {
      console.log(`    Message ${index + 1}: ${msg.role} - ${msg.content.substring(0, 50)}...`);
    });
  });
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener("DOMContentLoaded", initializeMentusTab);