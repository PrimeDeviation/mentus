document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('graph').innerHTML = '<object type="text/html" data="./graphview/graphview.html" width="100%" height="100%"></object>';
  document.getElementById('docs').innerHTML = '<object type="text/html" data="./documents/documents.html" width="100%" height="100%"></object>';
  document.getElementById('editor').innerHTML = '<object type="text/html" data="./editor/editor.html" width="100%" height="100%"></object>';
  document.getElementById('settings').innerHTML = '<object type="text/html" data="./settings/settings.html" width="100%" height="100%"></object>';

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
    activeTab.style.height = '100vh';
    activeTab.style.width = '100%';
  }
  loadChatModels();

  function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
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
      const anthropicModels = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-2.1'];
      anthropicModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        anthropicGroup.appendChild(option);
      });
      chatModelsDropdown.appendChild(anthropicGroup);
    }

    if (!openaiApiKey && !anthropicApiKey) {
      const noModelsOption = document.createElement('option');
      noModelsOption.value = '';
      noModelsOption.textContent = 'No validated models';
      noModelsOption.disabled = true;
      chatModelsDropdown.appendChild(noModelsOption);
    }

    // Add event listener to update the selected model with "(active)"
    chatModelsDropdown.addEventListener('change', function() {
      const selectedOption = chatModelsDropdown.options[chatModelsDropdown.selectedIndex];
      if (selectedOption.value) {
        selectedOption.textContent = `${selectedOption.value} (active)`;
      }
    });
  }

  // Chat bar functionality
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  sendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message';
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom

      // Save message to chat history
      saveMessageToHistory(`User: ${message}`);

      // Send message to OpenAI API
      sendMessageToOpenAI(message);
    }
  });

  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendButton.click();
    }
  });

  function saveMessageToHistory(message) {
    const timestamp = new Date().toISOString();
    const chatHistory = localStorage.getItem('chatHistory') || '';
    const updatedHistory = `${chatHistory}\n[${timestamp}] ${message}`;
    localStorage.setItem('chatHistory', updatedHistory);
  }

  function saveChatSession() {
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const topic = 'aggregate-topic'; // Replace with actual topic extraction logic
      const filename = `${timestamp}-${topic}.md`;
      const blob = new Blob([chatHistory], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      localStorage.removeItem('chatHistory');
    }
  }

  window.addEventListener('beforeunload', saveChatSession);

  // Load settings from localStorage
  const openaiApiKey = localStorage.getItem('openaiApiKey');
  const anthropicApiKey = localStorage.getItem('anthropicApiKey');
  const graphdbEndpoint = localStorage.getItem('graphdbEndpoint');
  const graphdbCreds = localStorage.getItem('graphdbCreds');
  const localStorageLocation = localStorage.getItem('localStorageLocation');

  // Populate settings form with loaded values
  document.getElementById('openai-api-key').value = openaiApiKey || '';
  document.getElementById('anthropic-api-key').value = anthropicApiKey || '';
  document.getElementById('graphdb-endpoint').value = graphdbEndpoint || '';
  document.getElementById('graphdb-creds').value = graphdbCreds || '';
  document.getElementById('local-storage-location').value = localStorageLocation || '';

  // Save settings when the save button is clicked
  document.getElementById('save-settings').addEventListener('click', () => {
    const openaiApiKey = document.getElementById('openai-api-key').value;
    const anthropicApiKey = document.getElementById('anthropic-api-key').value;
    const graphdbEndpoint = document.getElementById('graphdb-endpoint').value;
    const graphdbCreds = document.getElementById('graphdb-creds').value;
    const localStorageLocation = document.getElementById('local-storage-location').value;

    localStorage.setItem('openaiApiKey', openaiApiKey);
    localStorage.setItem('anthropicApiKey', anthropicApiKey);
    localStorage.setItem('graphdbEndpoint', graphdbEndpoint);
    localStorage.setItem('graphdbCreds', graphdbCreds);
    localStorage.setItem('localStorageLocation', localStorageLocation);

    // Reload chat models after saving settings
    loadChatModels();
  });

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
          saveMessageToHistory(`Assistant: ${assistantReply}`);
        } else {
          console.error('Error:', response.status);
          displayAssistantReply('Error: Unable to get a response from the AI model.');
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
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
  }
});
