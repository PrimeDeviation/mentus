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

    // Call this function when the page loads to display existing saved sessions
    displaySavedChatSessions();
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

document.addEventListener("DOMContentLoaded", initializeMentusTab);

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
            // Check if the value is base64 encoded
            if (/^[A-Za-z0-9+/=]+$/.test(result[key])) {
              const decodedKey = atob(result[key]);
              // Check if the decoded key starts with 'sk-' (typical for OpenAI keys)
              if (decodedKey.startsWith('sk-')) {
                resolve(decodedKey);
              } else {
                resolve(result[key]); // Return the original value if it's not an OpenAI key
              }
            } else {
              // If it's not base64 encoded, return it as is
              resolve(result[key]);
            }
          } catch (error) {
            console.error('Error processing API key:', error);
            // If there's an error, return the original value
            resolve(result[key]);
          }
        } else {
          resolve(null);
        }
      });
    });
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
      let response;
      if (selectedModel.includes('gpt')) {
        response = await sendMessageToOpenAI(message, selectedModel, apiKey);
      } else {
        response = await sendMessageToAnthropic(message, selectedModel, apiKey);
      }
      
      // Add user message to chat history
      const userMessageElement = document.createElement('div');
      userMessageElement.className = 'chat-message user-message';
      userMessageElement.textContent = message;
      chatMessages.appendChild(userMessageElement);

      // Add assistant response to chat history
      displayAssistantReply(response);

      // Scroll to the bottom of the chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error('Error:', error);
      displayAssistantReply(`Error: ${error.message}`);
    }
  }

  async function sendMessageToOpenAI(message, model, apiKey) {
    const decodedApiKey = atob(apiKey);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decodedApiKey}`
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
      const decodedApiKey = atob(apiKey);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': decodedApiKey,
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
