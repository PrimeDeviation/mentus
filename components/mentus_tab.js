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
    chatModelsDropdown.innerHTML = '<option value="">Select a model</option>';

    if (openaiApiKey) {
        // Fetch OpenAI models (mocked for this example)
        const openaiModels = ['text-davinci-003', 'text-curie-001'];
        openaiModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            chatModelsDropdown.appendChild(option);
        });
    }

    if (anthropicApiKey) {
        // Fetch Anthropic models (mocked for this example)
        const anthropicModels = ['claude-v1', 'claude-v2'];
        anthropicModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            chatModelsDropdown.appendChild(option);
        });
    }
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
    }
  });

  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendButton.click();
    }
  });
});
