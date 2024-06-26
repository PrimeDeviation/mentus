function initializeMentusTab() {
  try {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const tabName = event.target.getAttribute('data-tab');
        showTab(tabName);
      });
    });
    
    showTab('settings');
    
    loadChatModels();

    // Initialize chatMessages
    window.chatMessages = document.getElementById('chat-messages');

    // Call this function when the page loads to display existing saved sessions
    displaySavedChatSessions();

    // Load user profile data
    loadUserProfile();
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

function loadUserProfile() {
  chrome.storage.sync.get(['username', 'email', 'bio', 'githubToken', 'openaiApiKey', 'anthropicApiKey'], function(data) {
    // You can use this data to populate fields in the main UI if needed
    console.log('User profile loaded:', data);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  initializeMentusTab();
  
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
});

function showTab(tabName) {
  const tabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  const activeTab = document.getElementById(tabName);
  activeTab.classList.add('active');

  if (tabName === 'settings') {
    loadSettingsContent();
  }
}

function loadSettingsContent() {
  // Load saved settings
  loadSettings();

  // Add event listeners for each input field
  const settings = [
    'openai-api-key',
    'anthropic-api-key',
    'graphdb-endpoint',
    'graphdb-creds',
    'local-storage-location'
  ];

  settings.forEach(setting => {
    const inputElement = document.getElementById(setting);
    if (inputElement) {
      inputElement.addEventListener('input', debounce(function() {
        saveSetting(setting, this.value);
      }, 500));
    }
  });
}

// Implement these functions if they're not already defined
function loadSettings() {
  // Implementation for loading settings
}

function saveSetting(setting, value) {
  // Implementation for saving a setting
}

function debounce(func, wait) {
  // Implementation for debounce function
}

function saveChatSession() {
  // Implementation for saving chat session
}

function loadChatModels() {
  // Implementation for loading chat models
}

function displaySavedChatSessions() {
  // Implementation for displaying saved chat sessions
}

// Make sure all the necessary functions are defined here
function showTab(tabName) {
  const tabs = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  const activeTab = document.getElementById(tabName);
  activeTab.classList.add('active');

  if (tabName === 'settings') {
    loadSettingsContent();
  }
}

function loadSettingsContent() {
  // Load saved settings
  loadSettings();

  // Add event listeners for each input field
  const settings = [
    'openai-api-key',
    'anthropic-api-key',
    'graphdb-endpoint',
    'graphdb-creds',
    'local-storage-location'
  ];

  settings.forEach(setting => {
    const inputElement = document.getElementById(setting);
    if (inputElement) {
      inputElement.addEventListener('input', debounce(function() {
        saveSetting(setting, this.value);
      }, 500));
    }
  });
}

// Make sure to include the implementations of loadSettings, saveSetting, debounce, 
// saveChatSession, loadChatModels, and displaySavedChatSessions functions here
  
  function showTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }
    const activeTab = document.getElementById(tabName);
    activeTab.classList.add('active');

    if (tabName === 'settings') {
      loadSettingsContent();
    }
  }
  
  function loadSettingsContent() {
    // Load saved settings
    loadSettings();

    // Add event listeners for each input field
    const settings = [
      'openai-api-key',
      'anthropic-api-key',
      'graphdb-endpoint',
      'graphdb-creds',
      'local-storage-location'
    ];

    settings.forEach(setting => {
      const inputElement = document.getElementById(setting);
      if (inputElement) {
        inputElement.addEventListener('input', debounce(function() {
          saveSetting(setting, this.value);
        }, 500));
      }
    });
  }
  
  loadChatModels();

  function loadSettingsContent() {
    // Load saved settings
    loadSettings();

    // Add event listeners for each input field
    const settings = [
      'openai-api-key',
      'anthropic-api-key',
      'graphdb-endpoint',
      'graphdb-creds'
    ];

    settings.forEach(setting => {
      const inputElement = document.getElementById(setting);
      inputElement.addEventListener('keypress', async function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          await saveSetting(setting, this.value.trim());
        }
      });
    });
  }

  async function saveSetting(setting, value) {
    let updatedSetting;
    if (setting.includes('api-key')) {
      updatedSetting = { [setting]: btoa(value) }; // Encode API keys
    } else {
      updatedSetting = { [setting]: value };
    }

    // Save setting to chrome.storage.local
    await chrome.storage.local.set(updatedSetting);
    console.log(`${setting} saved successfully.`);
    await loadSettings(); // Reload settings after saving
    if (setting.includes('api-key')) {
      loadChatModels(); // Reload chat models if API key was changed
    }
  }

  function isObfuscated(value) {
    return /^\*+.{4}$/.test(value);
  }

  async function loadSettings() {
    const settings = [
      'openai-api-key',
      'anthropic-api-key',
      'graphdb-endpoint',
      'graphdb-creds',
      'local-storage-location'
    ];

    const result = await chrome.storage.local.get(settings);

    for (const setting of settings) {
      const inputElement = document.getElementById(setting);
      const displayElement = document.getElementById(`${setting}-display`);
      
      if (inputElement && displayElement) {
        let value = result[setting] || '';
      
        if (setting.includes('api-key') && value) {
          try {
            value = atob(value); // Decode API keys
            inputElement.value = ''; // Clear the input field for security
            const visiblePart = value.substring(0, 4);
            const obfuscatedPart = '*'.repeat(Math.max(0, value.length - 4));
            displayElement.textContent = visiblePart + obfuscatedPart;
          } catch (e) {
            console.error('Error decoding API key:', e);
            value = '';
            displayElement.textContent = 'Error: Invalid API key';
          }
        } else {
          inputElement.value = value;
          displayElement.textContent = value || 'No value set';
        }
      } else {
        console.error(`Element not found for setting: ${setting}`);
      }
    }
  }

  async function loadChatModels() {
    const result = await chrome.storage.local.get(['openai-api-key', 'anthropic-api-key']);
    const openaiApiKey = result['openai-api-key'];
    const anthropicApiKey = result['anthropic-api-key'];
    const chatModelsDropdown = document.getElementById('chat-models');

    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      const openaiGroup = document.createElement('optgroup');
      openaiGroup.label = 'GPT Models';
      const openaiModels = ['gpt-3.5-turbo', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-instruct', 'gpt-3.5-turbo-instruct-0914', 'gpt-4', 'gpt-4-0125-preview', 'gpt-4-0613', 'gpt-4-1106-preview', 'gpt-4-1106-vision-preview', 'gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo-preview', 'gpt-4-vision-preview', 'gpt-4o', 'gpt-4o-2024-05-13'];
      openaiModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        openaiGroup.appendChild(option);
      });
      chatModelsDropdown.appendChild(openaiGroup);
    }

    if (anthropicApiKey) {
      const anthropicGroup = document.createElement('optgroup');
      anthropicGroup.label = 'Anthropic Models';
      const anthropicModels = ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307', 'claude-2.1'];
      anthropicModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        anthropicGroup.appendChild(option);
      });
      chatModelsDropdown.appendChild(anthropicGroup);
    }

    if (!openaiApiKey && !anthropicApiKey) {
      const noApiKeyOption = document.createElement('option');
      noApiKeyOption.value = '';
      noApiKeyOption.textContent = 'No API keys found. Please provide an OpenAI or Anthropic API key.';
      noApiKeyOption.disabled = true;
      chatModelsDropdown.appendChild(noApiKeyOption);
    }
  }

  async function sendMessageToOpenAI(message) {
    const openaiApiKey = await getApiKey('openai-api-key');
    const selectedModel = document.getElementById('chat-models').value;

    if (!openaiApiKey) {
      displayAssistantReply('Error: OpenAI API key is missing or invalid. Please provide a valid API key in the settings.');
      return;
    }

    if (!selectedModel) {
      displayAssistantReply('Error: Please select a valid chat model.');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: message }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantReply = data.choices[0].message.content;
        displayAssistantReply(assistantReply);
      } else {
        const errorData = await response.json();
        console.error('Error:', response.status, errorData);
        displayAssistantReply(`Error: ${errorData.error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      displayAssistantReply(`Error: ${error.message}`);
    }
  }

  function getApiKey(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function(result) {
        if (result[key]) {
          try {
            // First, check if the string is valid base64
            if (isBase64(result[key])) {
              const decodedKey = atob(result[key]);
              resolve(decodedKey);
            } else {
              // If it's not base64, return the original string
              resolve(result[key]);
            }
          } catch (error) {
            console.error('Error processing API key:', error);
            // If there's an error, return the original string
            resolve(result[key]);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  function isBase64(str) {
    if (typeof str !== 'string') {
      return false;
    }
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  // Remove this block entirely

  async function sendMessage(message) {
    const selectedModel = document.getElementById('chat-models').value;
    const apiKey = await getApiKey(selectedModel.includes('gpt') ? 'openai-api-key' : 'anthropic-api-key');

    if (!apiKey) {
      displayAssistantReply('Error: API key is missing or invalid. Please provide a valid API key in the settings.');
      return;
    }

    if (!selectedModel) {
      displayAssistantReply('Error: Please select a valid chat model.');
      return;
    }

    try {
      // Add user message to chat history
      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'chat-message user-message';
      userMessageElement.textContent = message;
      chatMessages.appendChild(userMessageElement);

      // Scroll to the bottom of the chat
      chatMessages.scrollTop = chatMessages.scrollHeight;

      let response;
      if (selectedModel.includes('gpt')) {
        response = await sendMessageToOpenAI(message, selectedModel, apiKey);
      } else {
        response = await sendMessageToAnthropic(message, selectedModel, apiKey);
      }
      
      // Add assistant response to chat history
      displayAssistantReply(response);

      // Scroll to the bottom of the chat again
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error('Error:', error);
      displayAssistantReply(`Error: ${error.message}`);
    }
  }

  function isBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  async function sendMessageToOpenAI(message, model, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', data); // Log the entire response
    return data.choices[0].message.content;
  }

  async function sendMessageToAnthropic(message, model, apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 4000
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

  function displayAssistantReply(reply) {
    const replyElement = document.createElement('div');
    replyElement.className = 'chat-message assistant-message';
    replyElement.textContent = reply;
    chatMessages.appendChild(replyElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save the chat session after each assistant reply
    saveChatSession();
  }

  // Function removed

  function displaySavedChatSessions() {
    chrome.storage.local.get(['chatSessions'], function(result) {
      const chatSessions = result.chatSessions || [];
      console.log('Saved Chat Sessions:');
      chatSessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`);
        console.log(`  Timestamp: ${session.timestamp}`);
        console.log(`  Messages: ${session.messages.length}`);
        session.messages.forEach((msg, msgIndex) => {
          console.log(`    Message ${msgIndex + 1}: ${msg.type} - ${msg.content.substring(0, 50)}...`);
        });
      });
    });
  }

  // Call this function when the page loads to display existing saved sessions
  displaySavedChatSessions();

document.addEventListener("DOMContentLoaded", initializeMentusTab);
