document.addEventListener("DOMContentLoaded", () => {
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
    fetch('components/settings/settings.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('settings-content').innerHTML = html;
        const script = document.createElement('script');
        script.src = 'components/settings/settings_script.js';
        document.body.appendChild(script);
      })
      .catch(error => console.error('Error loading settings content:', error));
  }

  function loadChatModels() {
    chrome.storage.local.get(['openaiApiKey', 'anthropicApiKey'], function(result) {
      const openaiApiKey = result.openaiApiKey ? atob(result.openaiApiKey) : null;
      const anthropicApiKey = result.anthropicApiKey ? atob(result.anthropicApiKey) : null;
      const chatModelsDropdown = document.getElementById('chat-models');

      chatModelsDropdown.innerHTML = '';

      if (openaiApiKey) {
        const openaiGroup = document.createElement('optgroup');
        openaiGroup.label = 'GPT Models';
        const openaiModels = ['gpt-3.5-turbo', 'gpt-4'];
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
        const anthropicModels = ['claude-2.1'];
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

  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  if (chatInput && sendButton && chatMessages) {
    sendButton.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        sendMessageToOpenAI(message);
      }
    });

    chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendButton.click();
      }
    });
  }

  async function sendMessageToOpenAI(message) {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const selectedModel = document.getElementById('chat-models').value;

    if (openaiApiKey && selectedModel) {
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
  }

  function displayAssistantReply(reply) {
    const replyElement = document.createElement('div');
    replyElement.className = 'chat-message assistant-message';
    replyElement.textContent = reply;
    chatMessages.appendChild(replyElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
