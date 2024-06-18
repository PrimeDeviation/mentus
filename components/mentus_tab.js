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

    const validatedModels = [];

    if (openaiApiKey) {
        // Fetch OpenAI models
        fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const openaiModels = data.data.map(model => model.id);
            validatedModels.push(...openaiModels);
            updateDropdown(validatedModels);
        })
        .catch(error => {
            console.error('Error fetching OpenAI models:', error);
            updateDropdown(validatedModels);
        });
    } else {
        updateDropdown(validatedModels);
    }

    if (anthropicApiKey) {
        // Fetch Anthropic models (mocked for this example)
        const anthropicModels = ['claude-v1', 'claude-v2'];
        validatedModels.push(...anthropicModels);
        updateDropdown(validatedModels);
    } else {
        updateDropdown(validatedModels);
    }

    if (anthropicApiKey) {
        // Fetch Anthropic models (mocked for this example)
        const anthropicModels = ['claude-v1', 'claude-v2'];
        validatedModels.push(...anthropicModels);
        updateDropdown(validatedModels);
    } else {
        updateDropdown(validatedModels);
    }

    function updateDropdown(models) {
        chatModelsDropdown.innerHTML = '';
        if (models.length > 0) {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                chatModelsDropdown.appendChild(option);
            });
        } else {
            const noModelsOption = document.createElement('option');
            noModelsOption.value = '';
            noModelsOption.textContent = 'No validated models';
            noModelsOption.disabled = true;
            chatModelsDropdown.appendChild(noModelsOption);
        }
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
    }
  });

  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendButton.click();
    }
  });
});
