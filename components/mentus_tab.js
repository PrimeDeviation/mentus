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
      const openaiModels = ['gpt-4o']; // Representative model
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
      const anthropicModels = ['claude-3-opus-20240229']; // Representative model
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

  function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      const openaiGroup = document.createElement('optgroup');
      openaiGroup.label = 'GPT Models';
      const openaiModels = ['gpt-4o']; // Representative model
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
      const anthropicModels = ['claude-3-opus-20240229']; // Representative model
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

  function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      const openaiGroup = document.createElement('optgroup');
      openaiGroup.label = 'GPT Models';
      const openaiModels = ['gpt-4o']; // Representative model
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
      const anthropicModels = ['claude-3-opus-20240229']; // Representative model
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

  function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      const openaiGroup = document.createElement('optgroup');
      openaiGroup.label = 'GPT Models';
      const openaiModels = ['gpt-4o']; // Representative model
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
      const anthropicModels = ['claude-3-opus-20240229']; // Representative model
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

  function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      const openaiGroup = document.createElement('optgroup');
      openaiGroup.label = 'GPT Models';
      const openaiModels = ['gpt-4o']; // Representative model
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
      const anthropicModels = ['claude-3-opus-20240229']; // Representative model
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
      saveMessageToHistory(message);
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
});
