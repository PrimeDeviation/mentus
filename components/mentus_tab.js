document.addEventListener("DOMContentLoaded", function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const tabName = event.target.getAttribute('data-tab');
      showTab(tabName);
    });
  });
  
  showTab('settings');
  
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
  
  loadChatModels();

  function loadSettingsContent() {
    const settingsForm = document.getElementById('settings-form');
    const saveButton = document.getElementById('save-settings');

    // Load saved settings
    loadSettings();

    if (saveButton) {
      saveButton.addEventListener('click', function () {
        saveSettings();
      });
    }
  }

  async function saveSettings() {
    const settings = [
      'openai-api-key',
      'anthropic-api-key',
      'graphdb-endpoint',
      'graphdb-creds',
      'local-storage-location'
    ];

    const updatedSettings = {};

    for (const setting of settings) {
      const inputElement = document.getElementById(setting);
      const displayElement = document.getElementById(`${setting}-display`);
      const currentValue = inputElement.value.trim();
      const displayedValue = displayElement ? displayElement.textContent : '';

      // Only update if the value has changed and is not the obfuscated version
      if (currentValue && currentValue !== displayedValue && !isObfuscated(currentValue)) {
        if (setting.includes('api-key')) {
          // Use the Web Crypto API for encryption
          const encoder = new TextEncoder();
          const data = encoder.encode(currentValue);
          const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
          );
          const iv = window.crypto.getRandomValues(new Uint8Array(12));
          const encryptedData = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            data
          );
          const encryptedArray = new Uint8Array(encryptedData);
          const base64Encrypted = btoa(String.fromCharCode.apply(null, encryptedArray));
          updatedSettings[setting] = JSON.stringify({ encrypted: base64Encrypted, iv: Array.from(iv) });
          // Store the key securely
          await chrome.storage.local.set({ [`${setting}_key`]: await exportCryptoKey(key) });
        } else {
          updatedSettings[setting] = currentValue;
        }
      }
    }

    // Save settings to chrome.storage.local
    await chrome.storage.local.set(updatedSettings);
    alert('Settings saved successfully.');
    await loadSettings(); // Reload settings after saving
  }

  async function exportCryptoKey(key) {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return Array.from(new Uint8Array(exported));
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
            const { encrypted, iv } = JSON.parse(value);
            const key = await importCryptoKey(await chrome.storage.local.get(`${setting}_key`));
            const decryptedValue = await decryptData(encrypted, iv, key);
            inputElement.value = ''; // Clear the input field for security
            displayElement.textContent = decryptedValue ? '********' : '';
          } catch (e) {
            console.error('Error decrypting API key:', e);
            value = '';
          }
        } else {
          inputElement.value = value;
          displayElement.textContent = value;
        }
      } else {
        console.error(`Element not found for setting: ${setting}`);
      }
    }
  }

  async function importCryptoKey(keyData) {
    return await window.crypto.subtle.importKey(
      "raw",
      new Uint8Array(keyData),
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async function decryptData(encryptedBase64, iv, key) {
    const encryptedArray = new Uint8Array(atob(encryptedBase64).split('').map(char => char.charCodeAt(0)));
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      encryptedArray
    );
    return new TextDecoder().decode(decryptedData);
  }

  function loadChatModels() {
    chrome.storage.local.get(['openai-api-key', 'anthropic-api-key'], function(result) {
      const openaiApiKey = result['openai-api-key'] ? atob(result['openai-api-key']) : null;
      const anthropicApiKey = result['anthropic-api-key'] ? atob(result['anthropic-api-key']) : null;
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
    });
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
        resolve(result[key] ? atob(result[key]) : null);
      });
    });
  }

  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  if (chatInput && sendButton && chatMessages) {
    sendButton.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        sendMessage(message);
      }
    });

    chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendButton.click();
      }
    });
  }

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
      displayAssistantReply(response);
    } catch (error) {
      console.error('Error:', error);
      displayAssistantReply(`Error: ${error.message}`);
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
  }
});
