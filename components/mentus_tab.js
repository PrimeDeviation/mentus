// Constants for settings and chat models
window.SETTINGS = [
  'openai-api-key',
  'anthropic-api-key',
  'obsidian-api-key',
  'obsidian-endpoint',
  'obsidian-chat-path',
  'save-to-obsidian'
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

// Global variables for managing sessions
let sessions = {};
let currentSession = {
  id: null,
  messages: [],
  model: null
};

let profileDataReady = false;

// Add this function at the top of your script
function normalizeEndpoint(endpoint) {
    return endpoint.replace(/\/+$/, '');
}

// Onboarding steps definition using Intro.js
function initializeOnboarding() {
  console.log('Starting interactive onboarding with Intro.js');

  // Initialize the steps array
  const steps = [];

  // Step 1: Welcome
  steps.push({
    intro: "Welcome to Mentus! Let's get started with setting up your environment.",
  });

  // Step 2: Ensure Obsidian Local REST API Plugin is installed
  steps.push({
    intro: 'Please ensure that you have installed and configured the Obsidian Local REST API plugin in your Obsidian application.',
  });

  // Modify only the Google Account connection step
  steps.push({
    element: '#google-auth-button, #google-disconnect-button',
    intro: 'Connect your Google account to enable saving sessions to Google Drive, or disconnect if already connected.',
    position: 'bottom',
  });

  // Steps for entering API keys (always displayed)
  steps.push({
    element: '#openai-api-key',
    intro: 'Please enter your OpenAI API key to enable AI-powered chat with OpenAI models.',
    position: 'bottom',
  });

  steps.push({
    element: '#anthropic-api-key',
    intro: 'Please enter your Anthropic API key to enable AI-powered chat with Anthropic models.',
    position: 'bottom',
  });

  // Steps for entering Obsidian API settings
  steps.push({
    element: '#obsidian-api-key',
    intro: 'Please enter the API key from the Obsidian Local REST API plugin settings.',
    position: 'bottom',
  });

  steps.push({
    element: '#obsidian-endpoint',
    intro: 'Enter the REST API endpoint URL from your Obsidian Local REST API plugin settings.',
    position: 'bottom',
  });

  steps.push({
    element: '#obsidian-chat-path',
    intro: 'Specify the path in your Obsidian vault where chat sessions will be saved.',
    position: 'bottom',
  });

  // Step: Reinitialize the graph view after Obsidian settings are provided
  steps.push({
    intro: 'Now that you have provided the Obsidian settings, we will reinitialize the graph view.',
    onbeforechange: async () => {
      // Save all settings entered so far
      await window.settingsModule.saveAllSettings();

      // Initialize Obsidian
      await initializeObsidian();

      // Reinitialize the graph view now that settings are available
      await loadGraphView();
    },
  });

  // Step: Graph Interface Overview
  steps.push({
    element: '#graph-container',
    intro: 'The graph interface visualizes your knowledge connections. It may take some time to populate if your Obsidian graph is large.',
    position: 'top',
    onBeforeChange: function() {
      showTab('graph');
      // Trigger a resize event to make sure the graph fills the container
      window.dispatchEvent(new Event('resize'));
    }
  });

  // Step: Saving chat sessions to Obsidian
  steps.push({
    intro: 'Since you have provided the Obsidian API key and endpoint, your chat sessions will be saved to Obsidian automatically.',
  });

  // Start the Intro.js tour
  const intro = introJs()
    .setOptions({
      steps: steps,
      showProgress: true,
      exitOnOverlayClick: false,
      tooltipClass: 'customTooltip',
    })
    .onbeforeexit(async () => {
      // Set onboarding as completed when the tour finishes or is exited
      localStorage.setItem('mentusOnboardingCompleted', 'true');
      // Initialize remaining features
      await initializeRemainingFeatures();
    })
    .onchange((targetElement) => {
      // Handle tab changes based on the element being highlighted
      if (targetElement) {
        if (targetElement.id === 'google-auth-button' || targetElement.id === 'google-disconnect-button') {
          showTab('userprofile');
        } else if (
          targetElement.id === 'openai-api-key' ||
          targetElement.id === 'anthropic-api-key' ||
          targetElement.id === 'obsidian-api-key' ||
          targetElement.id === 'obsidian-endpoint' ||
          targetElement.id === 'obsidian-chat-path'
        ) {
          showTab('settings');
        } else if (targetElement.id === 'chat-models') {
          showTab('chat');
        } else if (targetElement.id === 'graph-container') {
          showTab('graph');
        } else if (targetElement.id === 'document-list') {
          showTab('docs');
        }
      }
    })
    .onafterchange(() => {
      // Update Intro.js dark mode after each step
      chrome.storage.local.get(['darkMode'], function(result) {
        updateIntroJsDarkMode(result.darkMode);
      });
    });

  // Apply initial dark mode state to Intro.js
  chrome.storage.local.get(['darkMode'], function(result) {
    updateIntroJsDarkMode(result.darkMode);
  });

  intro.start();
}

// Ensure this function is implemented and returns the correct connection status
function isGoogleConnected() {
  const connectButton = document.getElementById('google-auth-button');
  const disconnectButton = document.getElementById('google-disconnect-button');
  return connectButton.style.display === 'none' && disconnectButton.style.display !== 'none';
}

// Modify the hasAPIKeys function
async function hasAPIKeys() {
  const openAIKey = await window.settingsModule.getSetting('openai-api-key');
  const anthropicKey = await window.settingsModule.getSetting('anthropic-api-key');
  return {
    openAIKeySet: !!openAIKey,
    anthropicKeySet: !!anthropicKey,
  };
}

// Modify the initializeMentusTab function
async function initializeMentusTab() {
  try {
    console.log('Initializing Mentus Tab');
    initializeTabButtons();
    console.log('Tab buttons initialized');
    initializeDraggableResizer();
    console.log('Draggable resizer initialized');
    initializeDarkModeToggle();
    console.log('Dark mode toggle initialized');

    // Load settings
    if (window.settingsModule) {
      console.log('Loading existing settings');
      await window.settingsModule.loadExistingSettings();
      console.log('Initializing settings listeners');
      window.settingsModule.initializeSettingsListeners();
    } else {
      console.error('Settings module not found');
    }

    // Initialize essential features needed during onboarding
    await initializeEssentialFeatures();
    console.log('Essential features initialized');

    // Check if onboarding has been completed
    const onboardingCompleted = localStorage.getItem('mentusOnboardingCompleted');
    if (!onboardingCompleted) {
      console.log('Starting onboarding');
      initializeOnboarding();
    } else {
      console.log('Onboarding already completed, initializing remaining features');
      await initializeRemainingFeatures();
    }
    console.log('Mentus Tab initialization complete');
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
  }
}

// Initialize essential features needed during onboarding
async function initializeEssentialFeatures() {
  try {
    // Initialize Documents
    if (window.initializeDocuments) {
      console.log('Initializing Documents');
      await window.initializeDocuments();
      console.log('Documents initialized');
    } else {
      console.error('initializeDocuments function not found');
    }

    // Initialize Graph View
    if (window.loadGraphView) {
      console.log('Initializing Graph View');
      await window.loadGraphView();
      console.log('Graph View initialized');
    } else {
      console.error('loadGraphView function not found');
    }
  } catch (error) {
    console.error('Error in initializeEssentialFeatures:', error);
  }
}

// Initialize remaining features after onboarding
async function initializeRemainingFeatures() {
  try {
    // Initialize Obsidian
    console.log('Initializing Obsidian');
    await initializeObsidian();
    console.log('Obsidian initialized');

    // Load chat models
    console.log('About to load chat models');
    await loadChatModels();
    console.log('Chat models loaded');

    // Load sessions
    console.log('Loading sessions');
    const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
    if (saveToObsidian) {
      await loadObsidianSessions();
    } else {
      await loadSessions();
    }
    console.log('Sessions loaded');
    updateSessionList();

    // Initialize chat and session listeners
    initializeChatListeners();
    console.log('Chat listeners initialized');
    initializeSessionListeners();
    console.log('Session listeners initialized');

    // Start a new session if none exists
    if (!currentSession.id) {
      console.log('No current session, starting new session');
      await startNewSession();
    }

    // Optionally, show a default tab
    // showTab('chat');
  } catch (error) {
    console.error('Error in initializeRemainingFeatures:', error);
  }
}

function initializeDraggableResizer() {
  console.log('Initializing draggable resizer');
  const chatbar = document.getElementById('chatbar');
  const resizeHandle = document.getElementById('resize-handle');
  const content = document.getElementById('content');

  if (!chatbar || !resizeHandle || !content) {
      console.error('One or more elements for draggable resizer not found');
      return;
  }

  let isResizing = false;

  resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
  });

  function handleMouseMove(e) {
      if (!isResizing) return;
      const newWidth = e.clientX;
      chatbar.style.width = `${newWidth}px`;
      content.style.width = `calc(100% - ${newWidth}px)`;
  }

  function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
  }

  console.log('Draggable resizer initialized');
}

async function initializeObsidian() {
  console.log('Initializing Obsidian');
  try {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    let endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    // Normalize the endpoint
    endpoint = normalizeEndpoint(endpoint);

    const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    if (!apiKey || !endpoint) {
      console.log('Obsidian API key or endpoint not set, skipping initialization');
      return;
    }

    console.log('Obsidian settings loaded');
    
    // Optionally, you can check the connection to Obsidian here
    const isConnected = await checkObsidianConnection(apiKey, endpoint);
    if (isConnected) {
      console.log('Successfully connected to Obsidian');
    } else {
      console.warn('Failed to connect to Obsidian');
    }
  } catch (error) {
    console.error('Error initializing Obsidian:', error);
  }
}

async function checkObsidianConnection(apiKey, endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking Obsidian connection:', error);
    return false;
  }
}
// Initialize tab buttons
function initializeTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      showTab(tabName);
    });
  });
}

// Update the showTab function
function showTab(tabName) {
  console.log(`Showing tab: ${tabName}`);
  const tabs = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-button');

  tabs.forEach(tab => {
    tab.style.display = tab.id === tabName ? 'block' : 'none';
  });

  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab') === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Trigger a resize event when showing the graph tab
  if (tabName === 'graph') {
    window.dispatchEvent(new Event('resize'));
    if (window.graphviewModule && window.graphviewModule.showGraph) {
      window.graphviewModule.showGraph();
    }
  }

  console.log(`Tab ${tabName} is now visible`);
}

// Add this constant to identify visual models
const VISUAL_MODELS = ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'gpt-4o', 'gpt-4o-2024-05-13', 'gpt-4o-mini', 'chatgpt-4o-latest', 'gpt-4o-2024-08-06'];

// Load chat models
async function loadChatModels() {
  console.log('Entering loadChatModels function');
  try {
    console.log('Attempting to get OpenAI API key');
    const openaiApiKey = await window.settingsModule.getSetting('openai-api-key');
    console.log('OpenAI API Key retrieved:', openaiApiKey ? 'Yes (length: ' + openaiApiKey.length + ')' : 'No');
    
    console.log('Attempting to get Anthropic API key');
    const anthropicApiKey = await window.settingsModule.getSetting('anthropic-api-key');
    console.log('Anthropic API Key retrieved:', anthropicApiKey ? 'Yes (length: ' + anthropicApiKey.length + ')' : 'No');
    
    const chatModelsDropdown = document.getElementById('chat-models');

    if (!chatModelsDropdown) {
      console.error('Chat models dropdown not found');
      return;
    }

    console.log('Clearing chat models dropdown');
    chatModelsDropdown.innerHTML = '';

    if (openaiApiKey) {
      console.log('Adding OpenAI models');
      addModelOptions(chatModelsDropdown, 'GPT Models', CHAT_MODELS.openai);
    }

    if (anthropicApiKey) {
      console.log('Adding Anthropic models');
      addModelOptions(chatModelsDropdown, 'Anthropic Models', CHAT_MODELS.anthropic);
    }

    if (!openaiApiKey && !anthropicApiKey) {
      console.log('No API keys found, adding no-key option');
      addNoApiKeyOption(chatModelsDropdown);
    }

    // Set default model to gpt-4o
    chatModelsDropdown.value = 'gpt-4o';

    chatModelsDropdown.addEventListener('change', handleModelChange);
    handleModelChange();

    console.log('Chat models loaded successfully');
  } catch (error) {
    console.error('Error loading chat models:', error);
  }
  console.log('Exiting loadChatModels function');
}

// Modify the addModelOptions function to return the optgroup
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

// Add no API key option to dropdown
function addNoApiKeyOption(dropdown) {
  const option = document.createElement('option');
  option.value = '';
  option.textContent = 'No API keys found. Please provide an OpenAI or Anthropic API key.';
  option.disabled = true;
  dropdown.appendChild(option);
}

// Handle model change
function handleModelChange() {
  const selectedModel = document.getElementById('chat-models').value;
  const imageAttachButton = document.getElementById('image-attach-button');
  
  if (imageAttachButton) {
    if (VISUAL_MODELS.includes(selectedModel)) {
      imageAttachButton.style.display = 'inline-block';
    } else {
      imageAttachButton.style.display = 'none';
    }
  } else {
    console.error('Image attach button not found');
  }
}

// Handle image attachment
function handleImageAttachment() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        // Store the image data to be sent with the next message
        currentSession.pendingImage = {
          data: imageData.split(',')[1], // Remove the data URL prefix
          mimeType: file.type
        };
        // Update UI to show that an image is attached
        const imageAttachButton = document.getElementById('image-attach-button');
        if (imageAttachButton) {
          imageAttachButton.classList.add('image-attached');
          imageAttachButton.textContent = 'IMG ✓';
        }
      };
      reader.readAsDataURL(file);
    }
    document.body.removeChild(fileInput);
  });

  fileInput.click();
}

function initializeChatListeners() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const imageAttachButton = document.getElementById('image-attach-button');

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

    chatInput.addEventListener('input', handleChatInput);
    
    if (imageAttachButton) {
        imageAttachButton.addEventListener('click', handleImageAttachment);
    } else {
        console.error('Image attach button not found');
    }
}

let mentionSuggestions = [];

async function handleChatInput(e) {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
        const mentionText = mentionMatch[1];
        const suggestions = await fetchMentionSuggestions(mentionText);
        displayMentionSuggestions(suggestions, input, cursorPosition);
    } else {
        hideMentionSuggestions();
    }
}

async function fetchMentionSuggestions(query) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    if (!apiKey || !endpoint) {
        console.error('Obsidian API key or endpoint not set');
        return [];
    }

    try {
        const response = await fetch(`${endpoint}/vault/`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.files
            .filter(file => file.toLowerCase().includes(query.toLowerCase()) && file.endsWith('.md'))
            .map(file => ({
                name: file.replace('.md', ''),
                path: file
            }));
    } catch (error) {
        console.error('Error fetching mention suggestions:', error);
        return [];
    }
}

function displayMentionSuggestions(suggestions, input, cursorPosition) {
    const suggestionList = document.getElementById('mention-suggestions');
    if (!suggestionList) {
        const newSuggestionList = document.createElement('ul');
        newSuggestionList.id = 'mention-suggestions';
        newSuggestionList.style.position = 'absolute';
        newSuggestionList.style.zIndex = '1000';
        input.parentNode.appendChild(newSuggestionList);
    }

    const list = document.getElementById('mention-suggestions');
    list.innerHTML = '';
    mentionSuggestions = suggestions;

    suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.textContent = suggestion.name;
        li.addEventListener('click', () => selectMention(suggestion, input, cursorPosition));
        list.appendChild(li);
    });

    positionSuggestionList(list, input);
}

function positionSuggestionList(list, input) {
    const inputRect = input.getBoundingClientRect();
    list.style.top = `${inputRect.bottom}px`;
    list.style.left = `${inputRect.left}px`;
    list.style.width = `${inputRect.width}px`;
}

function hideMentionSuggestions() {
    const suggestionList = document.getElementById('mention-suggestions');
    if (suggestionList) {
        suggestionList.innerHTML = '';
    }
}

function selectMention(suggestion, input, cursorPosition) {
    const textBeforeMention = input.value.substring(0, cursorPosition).replace(/@\w*$/, '');
    const textAfterMention = input.value.substring(cursorPosition);
    input.value = `${textBeforeMention}@${suggestion.name} ${textAfterMention}`;
    hideMentionSuggestions();
    input.focus();
}

// Helper function to get API key
async function getApiKey(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(result) {
            console.log(`Retrieving ${key} from storage`);
            if (chrome.runtime.lastError) {
                console.error('Error retrieving API key:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                const encodedKey = result[key];
                console.log(`Encoded key found: ${encodedKey ? 'Yes' : 'No'}`);
                if (encodedKey) {
                    try {
                        const decodedKey = atob(encodedKey);
                        console.log(`API key for ${key} retrieved and decoded successfully`);
                        resolve(decodedKey);
                    } catch (error) {
                        console.error('Error decoding API key:', error);
                        reject(error);
                    }
                } else {
                    console.warn(`No API key found for ${key}`);
                    resolve(null);
                }
            }
        });
    });
}

// Send a message to OpenAI
async function sendMessageToOpenAI(model, apiKey, messages) {
  try {
    console.log('Sending message to OpenAI API');
    console.log('Model:', model);
    console.log('Messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => {
          if (Array.isArray(msg.content)) {
            return {
              role: msg.role,
              content: msg.content
            };
          }
          return msg;
        })
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in sendMessageToOpenAI:', error);
    throw error;
  }
}

// Send a message to Anthropic
async function sendMessageToAnthropic(model, apiKey, messages) {
  try {
    console.log('Sending message to Anthropic API');
    console.log('Model:', model);
    console.log('Messages:', messages);

    const anthropicMessages = messages.map(msg => {
      if (Array.isArray(msg.content)) {
        return {
          role: msg.role,
          content: msg.content.map(content => {
            if (content.type === 'image_url') {
              return {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: content.image_url.url.split(';')[0].split(':')[1],
                  data: content.image_url.url.split(',')[1]
                }
              };
            } else {
              return content;
            }
          })
        };
      } else {
        return msg;
      }
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true' // Add this header for Chrome extensions
      },
      body: JSON.stringify({
        model: model,
        messages: anthropicMessages,
        max_tokens: 4096
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

// Display assistant reply
function displayAssistantReply(reply) {
  addMessageToChat('assistant-message', reply);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize documents listeners
function initializeDocumentsListeners() {
  console.log('Initializing documents listeners');
  // Remove the code that tries to add an event listener to the load button
}

// Load sessions from storage
async function loadSessions() {
  console.log('Loading sessions');
  try {
    const result = await chrome.storage.local.get('sessions');
    sessions = result.sessions || {};
    console.log('Loaded sessions:', sessions);
    updateSessionList();
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
}

async function loadObsidianSessions() {
  console.log('Loading Obsidian sessions');
  try {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    let endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    let chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    // Normalize endpoint by removing trailing slash
    endpoint = endpoint.replace(/\/$/, '');

    // Normalize chatPath by ensuring it starts with a slash and ends with a slash
    chatPath = '/' + chatPath.replace(/^\/|\/$/g, '') + '/';

    const url = `${endpoint}/vault${chatPath}`;

    console.log('Fetching Obsidian sessions from:', url);

    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Obsidian API response:', data);

    if (!data.files || !Array.isArray(data.files)) {
      console.error('Unexpected response format:', data);
      throw new Error('Unexpected response format from Obsidian API');
    }

    sessions = {};
    for (const file of data.files) {
      if (file.endsWith('.md')) {
        const sessionId = file.replace('.md', '');
        sessions[sessionId] = { id: sessionId, name: file };
      }
    }
    console.log('Loaded Obsidian sessions:', sessions);
    updateSessionList();
  } catch (error) {
    console.error('Error loading Obsidian sessions:', error);
  }
}

// Update the session list in the UI
function updateSessionList() {
  console.log('Updating session list');
  const sessionDropdown = document.getElementById('saved-sessions');
  sessionDropdown.innerHTML = '<option value="">Select a session</option>';
  
  Object.values(sessions).forEach(session => {
    const option = document.createElement('option');
    option.value = session.id;
    option.textContent = session.name || `Session ${session.id}`;
    sessionDropdown.appendChild(option);
  });
  
  console.log('Session list updated');
}

// Load a specific session
async function loadSession(sessionId) {
  console.log(`Loading session: ${sessionId}`);
  const session = sessions[sessionId];
  if (session) {
    try {
      const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
      
      if (saveToObsidian) {
        await loadObsidianSessionContent(session);
      } else {
        await loadGoogleDriveSessionContent(session);
      }

      currentSession = session;
      
      // Update the chat model dropdown
      const chatModelsDropdown = document.getElementById('chat-models');
      if (chatModelsDropdown) {
        if (session.model) {
          chatModelsDropdown.value = session.model;
        } else {
          // If no model is set for the session, keep the current selection
          session.model = chatModelsDropdown.value;
        }
      }
      
      // Update the session dropdown to reflect the loaded session
      const sessionDropdown = document.getElementById('saved-sessions');
      if (sessionDropdown) {
        sessionDropdown.value = sessionId;
      }

      // Update session name input field
      const sessionNameInput = document.getElementById('session-name-input');
      if (sessionNameInput) {
        sessionNameInput.value = session.name;
      }

      // Explicitly update the chat session UI
      await updateChatSession();

    } catch (error) {
      console.error('Error loading session content:', error);
      alert(`Failed to load session: ${error.message}`);
      // Reset the session dropdown
      const sessionDropdown = document.getElementById('saved-sessions');
      if (sessionDropdown) {
        sessionDropdown.value = '';
      }
    }
  } else {
    console.error('Session not found:', sessionId);
  }
}

async function loadObsidianSessionContent(session) {
  const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
  let endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
  let chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

  // Normalize endpoint
  endpoint = endpoint.replace(/\/$/, '');

  // Normalize chatPath
  chatPath = '/' + chatPath.replace(/^\/|\/$/g, '') + '/';

  const url = `${endpoint}/vault${chatPath}${session.name}`;
  console.log('Loading Obsidian session from:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    session.messages = parseMarkdownToMessages(content);
    
    // Extract model from markdown
    const extractedModel = extractModelFromMarkdown(content);
    
    // Prioritize the model in this order: 
    // 1. Model extracted from the session content
    // 2. Model already stored in the session object
    // 3. Currently selected model in the dropdown
    const chatModelsDropdown = document.getElementById('chat-models');
    session.model = extractedModel || session.model || (chatModelsDropdown ? chatModelsDropdown.value : null);

    // Update the UI
    updateChatSession();
    
    // Set the model in the dropdown
    if (chatModelsDropdown && session.model) {
      chatModelsDropdown.value = session.model;
    }
    
    console.log('Session loaded:', session);
    return content;
  } catch (error) {
    console.error('Error loading Obsidian session content:', error);
    alert(`Failed to load session content: ${error.message}`);
    throw error;
  }
}

async function loadGoogleDriveSessionContent(session) {
  const token = await new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${session.id}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const content = await response.text();
  session.messages = parseMarkdownToMessages(content);
  session.model = extractModelFromMarkdown(content);
}

function parseMarkdownToMessages(markdown) {
  const lines = markdown.split('\n');
  const messages = [];
  let currentMessage = null;

  for (const line of lines) {
    if (line.startsWith('## User') || line.startsWith('## USER') || 
        line.startsWith('## Assistant') || line.startsWith('## ASSISTANT')) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = {
        role: line.toUpperCase().includes('USER') ? 'user' : 'assistant',
        content: ''
      };
    } else if (currentMessage) {
      currentMessage.content += line + '\n';
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages.map(msg => ({
    ...msg,
    content: msg.content.trim()
  }));
}

function extractModelFromMarkdown(markdown) {
  const modelLine = markdown.split('\n').find(line => line.startsWith('Model:'));
  return modelLine ? modelLine.split(':')[1].trim() : null;
}

// Update the chat session in the UI
function updateChatSession() {
  console.log('Updating chat session');
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  chatMessages.innerHTML = '';
  if (currentSession && currentSession.messages) {
    for (const msg of currentSession.messages) {
      if (Array.isArray(msg.content)) {
        for (const content of msg.content) {
          if (content.type === 'text') {
            addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', content.text);
          } else if (content.type === 'image_url') {
            addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', '', { url: content.image_url.url });
          }
        }
      } else {
        addMessageToChat(msg.role === 'user' ? 'user-message' : 'assistant-message', msg.content);
      }
    }
  } else {
    console.warn('No messages in current session');
  }
}

// Add a message to the chat UI
function addMessageToChat(className, message, imageData = null) {
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${className}`;
    
    if (imageData) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'image-container';
      
      if (imageData.url.startsWith('data:')) {
        const img = document.createElement('img');
        img.src = imageData.url;
        img.className = 'message-image';
        img.alt = 'Attached image';
        imageContainer.appendChild(img);
      } else {
        const imageName = imageData.url.split('/').pop();
        const truncatedName = imageName.length > 20 ? imageName.substring(0, 17) + '...' : imageName;
        const imageLink = document.createElement('a');
        imageLink.href = '#';
        imageLink.textContent = `📎 ${truncatedName}`;
        imageLink.onclick = (e) => {
          e.preventDefault();
          // Optionally, add logic to display the image when clicked
        };
        imageContainer.appendChild(imageLink);
      }
      
      messageElement.appendChild(imageContainer);
    }
    
    if (message) {
      const messageContent = document.createElement('div');
      messageContent.textContent = message;
      messageElement.appendChild(messageContent);
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
  } else {
    console.error('Chat messages container not found');
    return null;
  }
}

// Initialize the Mentus Tab when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded and parsed");
  console.log("Editor module:", window.editorModule);
  initializeMentusTab();
});

// Initialize session listeners
function initializeSessionListeners() {
  console.log('Initializing session listeners');
  const saveSessionButton = document.getElementById('save-session-button');
  if (saveSessionButton) {
    saveSessionButton.addEventListener('click', saveCurrentSession);
  }

  const newSessionButton = document.getElementById('new-session-button');
  if (newSessionButton) {
    newSessionButton.addEventListener('click', startNewSession);
  }

  const chatModelsDropdown = document.getElementById('chat-models');
  if (chatModelsDropdown) {
    chatModelsDropdown.addEventListener('change', handleModelChange);
  }

  const savedSessionsDropdown = document.getElementById('saved-sessions');
  if (savedSessionsDropdown) {
    savedSessionsDropdown.addEventListener('change', handleSessionChange);
  }

  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    sessionNameInput.addEventListener('change', handleSessionNameChange);
    sessionNameInput.addEventListener('blur', handleSessionNameChange);
  }

  // Add event listener for Restart Onboarding button
  const restartOnboardingButton = document.getElementById('restart-onboarding');
  if (restartOnboardingButton) {
    restartOnboardingButton.addEventListener('click', () => {
      // Clear the onboarding completed flag
      localStorage.removeItem('mentusOnboardingCompleted');
      // Start the onboarding process
      initializeOnboarding();
    });
  }
}

// Add this function to handle dark mode toggle
function initializeDarkModeToggle() {
    console.log('Initializing dark mode toggle');
    const toggleButton = document.getElementById('toggle-dark-mode');
    if (!toggleButton) {
        console.error('Dark mode toggle button not found');
        return;
    }

    toggleButton.addEventListener('click', () => {
        console.log('Dark mode toggle clicked');
        chrome.storage.local.get(['darkMode'], function(result) {
            const newDarkMode = !result.darkMode;
            chrome.storage.local.set({ 'darkMode': newDarkMode }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving dark mode preference:', chrome.runtime.lastError);
                } else {
                    console.log('Dark mode preference saved:', newDarkMode);
                    applyDarkMode(newDarkMode);
                }
            });
        });
    });

    // Apply initial dark mode state
    chrome.storage.local.get(['darkMode'], function(result) {
        console.log('Retrieved dark mode preference:', result.darkMode);
        applyDarkMode(result.darkMode);
    });
}

// Add this new function to apply dark mode
function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateDarkModeButtonText(isDarkMode);
    updateIntroJsDarkMode(isDarkMode); // Add this line
}

// Modify the updateDarkModeButtonText function
function updateDarkModeButtonText(isDarkMode) {
    const toggleButton = document.getElementById('toggle-dark-mode');
    if (toggleButton) {
        toggleButton.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        toggleButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        console.log('Updated dark mode button text:', toggleButton.textContent);
    } else {
        console.error('Dark mode toggle button not found in updateDarkModeButtonText');
    }
}

// Start a new session
async function startNewSession() {
  console.log('Starting new session');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
  const sessionName = `Chat_${timestamp}`;
  currentSession = {
    id: Date.now().toString(),
    messages: [],
    model: document.getElementById('chat-models').value,
    name: sessionName
  };
  sessions[currentSession.id] = currentSession;

  // Update the session name input
  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    sessionNameInput.value = sessionName;
  }

  updateSessionList();
  updateChatSession();

  // Save the new session immediately
  await saveCurrentSession();
}

// Save the current session
async function saveCurrentSession() {
  console.log('Saving current session');
  if (!currentSession.id) {
    console.warn('No current session to save, creating a new one');
    await startNewSession();
    return;
  }

  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput) {
    currentSession.name = sessionNameInput.value.trim().replace(/\s+/g, '_');
    sessionNameInput.value = currentSession.name;
  }

  // Create markdown content
  let markdownContent = await createMarkdownFromSession(currentSession);

  // Check if we should save to Obsidian via GitHub
  const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
  const isGitHubConnected = await window.isGitHubAuthenticated();

  if (saveToObsidian && isGitHubConnected) {
    await saveToGitHub(markdownContent);
  } else if (saveToObsidian) {
    await saveToObsidianVault(markdownContent);
  } else {
    await saveToGoogleDrive(markdownContent);
  }

  // Update local storage
  sessions[currentSession.id] = currentSession;
  await saveSessions();
  updateSessionList();

  // Ensure the current session remains selected in the dropdown
  const sessionDropdown = document.getElementById('saved-sessions');
  if (sessionDropdown && currentSession.id) {
    sessionDropdown.value = currentSession.id;
  }

  console.log('Session saved successfully');
}

// Modify the saveImageToObsidian function
async function saveImageToObsidian(imageData, mimeType) {
  const obsidianApiKey = await window.settingsModule.getSetting('obsidian-api-key');
  const obsidianEndpoint = await window.settingsModule.getSetting('obsidian-endpoint');
  const obsidianChatPath = await window.settingsModule.getSetting('obsidian-chat-path');

  if (!obsidianApiKey || !obsidianEndpoint || !obsidianChatPath) {
    console.error('Obsidian settings are not complete');
    return null;
  }

  const timestamp = Date.now();
  const imageExtension = mimeType.split('/')[1];
  const imageName = `image_${timestamp}.${imageExtension}`;
  const imagePath = `${obsidianChatPath}/images/${imageName}`;

  try {
    await saveFileToObsidian(obsidianApiKey, obsidianEndpoint, imagePath, imageData);
    return `images/${imageName}`;
  } catch (error) {
    console.error('Error saving image to Obsidian:', error);
    return null;
  }
}

// Update the createMarkdownFromSession function
async function createMarkdownFromSession(session) {
  let markdown = `# ${session.name || 'Untitled Session'}\n\n`;
  markdown += `Model: ${session.model}\n\n`;
  
  for (const msg of session.messages) {
    markdown += `## ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n`;
    if (Array.isArray(msg.content)) {
      for (const content of msg.content) {
        if (content.type === 'text') {
          markdown += `${content.text}\n\n`;
        } else if (content.type === 'image_url') {
          markdown += `![](${content.image_url.url})\n\n`;
        }
      }
    } else {
      markdown += `${msg.content}\n\n`;
    }
  }
  return markdown;
}

async function saveFileToObsidian(apiKey, endpoint, filePath, content) {
  // Normalize the endpoint
  endpoint = normalizeEndpoint(endpoint);

  const url = `${endpoint}/vault/${encodeURIComponent(filePath)}`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/octet-stream'
      },
      body: content
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`File saved to Obsidian: ${filePath}`);
  } catch (error) {
    console.error('Error saving file to Obsidian:', error);
    throw error;
  }
}

// Save all sessions to storage
async function saveSessions() {
  console.log('Saving all sessions');
  if (!chrome.storage) {
    console.error('Chrome storage API not available');
    return;
  }

  try {
    await chrome.storage.local.set({ chatSessions: Object.values(sessions) });
    console.log('Sessions saved successfully');
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Handle session change
function handleSessionChange(event) {
  console.log('Session changed:', event.target.value);
  loadSession(event.target.value);
}

// Add this new function to handle session name changes
function handleSessionNameChange() {
  const sessionNameInput = document.getElementById('session-name-input');
  if (sessionNameInput && currentSession) {
    const newName = sessionNameInput.value.trim().replace(/\s+/g, '_');
    if (newName !== currentSession.name) {
      currentSession.name = newName;
      updateSessionList();
      saveCurrentSession();
    }
  }
}

async function sendMessage(message) {
  const model = document.getElementById('chat-models').value;
  if (!model) {
    alert('Please select a model');
    return;
  }

  if (!currentSession.id) {
    console.warn('No current session, creating a new one');
    await startNewSession();
  }

  try {
    let apiKey;
    if (model.includes('gpt')) {
      apiKey = await window.settingsModule.getSetting('openai-api-key');
    } else if (model.startsWith('claude')) {
      apiKey = await window.settingsModule.getSetting('anthropic-api-key');
    }

    if (!apiKey) {
      throw new Error('API key not found. Please check your settings.');
    }

    console.log('Sending message to model:', model);
    console.log('API Key (first 4 characters):', apiKey.substring(0, 4));

    let messageContent;
    const hasImage = !!currentSession.pendingImage;
    if (hasImage) {
      const imageDataUrl = `data:${currentSession.pendingImage.mimeType};base64,${currentSession.pendingImage.data}`;
      messageContent = [
        {
          type: "image_url",
          image_url: {
            url: imageDataUrl
          }
        },
        {
          type: "text",
          text: message
        }
      ];
      addMessageToChat('user-message', message, { url: imageDataUrl });
      
      // Save image to Obsidian for future reference
      const imagePath = await saveImageToObsidian(currentSession.pendingImage.data, currentSession.pendingImage.mimeType);
      if (imagePath) {
        console.log('Image saved to Obsidian:', imagePath);
      } else {
        console.error('Failed to save image to Obsidian');
      }
    } else {
      messageContent = [{ type: "text", text: message }];
      addMessageToChat('user-message', message);
    }

    currentSession.messages.push({ role: 'user', content: messageContent });

    let response;
    if (model.includes('gpt')) {
      response = await sendMessageToOpenAI(model, apiKey, currentSession.messages);
    } else if (model.startsWith('claude')) {
      response = await sendMessageToAnthropic(model, apiKey, currentSession.messages);
    }

    addMessageToChat('assistant-message', response);
    currentSession.messages.push({ role: 'assistant', content: response });
    await saveCurrentSession();

    // Reset the image attachment UI
    const imageAttachButton = document.getElementById('image-attach-button');
    if (imageAttachButton) {
      imageAttachButton.classList.remove('image-attached');
      imageAttachButton.textContent = 'IMG';
    }
    currentSession.pendingImage = null;

    // Update the session dropdown to maintain the current selection
    const sessionDropdown = document.getElementById('saved-sessions');
    if (sessionDropdown && currentSession.id) {
      sessionDropdown.value = currentSession.id;
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert(`Error sending message: ${error.message}`);
  }
}

async function saveToObsidianVault(content) {
  const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
  let endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
  const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

  if (!apiKey || !endpoint || !chatPath) {
    console.error('Obsidian settings are not complete');
    alert('Obsidian settings are not complete. Please check your settings.');
    return;
  }

  // Normalize endpoint
  if (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1);
  }

  // Ensure chatPath starts with a slash and does not end with one
  const formattedChatPath = chatPath.startsWith('/') ? chatPath : `/${chatPath}`;

  const fileName = `${currentSession.name}.md`;
  const filePath = `${formattedChatPath}/${fileName}`;

  console.log('Saving to Obsidian:', filePath);
  console.log('Content length:', content.length);

  try {
    const url = `${endpoint}/vault${filePath}`;
    console.log('Request URL:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'text/markdown'
      },
      body: content
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from Obsidian API:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log('Session saved to Obsidian file');
  } catch (error) {
    console.error('Error saving session to Obsidian:', error);
    alert(`Failed to save the session to Obsidian. Error: ${error.message}\nPlease check your settings and try again.`);
  }
}

// Add this function to handle saving sessions to Google Drive
async function saveToGoogleDrive(content) {
  console.log('Saving session to Google Drive');
  try {
    // Obtain the OAuth token
    const token = await getGoogleAuthToken();

    if (!token) {
      throw new Error('Google OAuth token not available. Please connect your Google account.');
    }

    // Ensure the Mentus Workspace folder exists
    const folderId = await window.ensureMentusWorkspaceFolder(token);
    if (!folderId) {
      throw new Error('Mentus Workspace folder could not be found or created.');
    }

    // Prepare the metadata for the file to be saved
    const fileName = `${currentSession.name}.md`;
    const fileMetadata = {
      name: fileName,
      mimeType: 'text/markdown',
      parents: [folderId] // Save the file into the Mentus Workspace folder
    };

    // Prepare the multipart request body
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'text/markdown' }));

    // Send the request to Google Drive API
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Drive API Error:', errorData);
      throw new Error(`Google Drive API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    console.log('Session saved to Google Drive:', data);
  } catch (error) {
    console.error('Error saving session to Google Drive:', error);
    alert(`Failed to save the session to Google Drive. Error: ${error.message}\nPlease check your Google account connection and try again.`);
  }
}

// Helper function to get Google OAuth token
async function getGoogleAuthToken() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        console.error('Error getting auth token:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(token);
      }
    });
  });
}

// Add this function to mentus_tab.js
async function ensureMentusWorkspaceFolder(token) {
  console.log('Ensuring Mentus Workspace folder exists');
  
  // Try to get the folder ID from local storage
  const storedFolderId = await new Promise((resolve) => {
    chrome.storage.local.get('mentusFolderId', function(result) {
      resolve(result.mentusFolderId);
    });
  });

  if (storedFolderId) {
    console.log('Mentus Workspace folder ID retrieved from storage:', storedFolderId);
    return storedFolderId;
  }

  try {
    // Search for an existing "Mentus Workspace" folder
    const searchResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name%3D%27Mentus%20Workspace%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27%20and%20trashed%3Dfalse',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      console.log('Existing Mentus Workspace folder found:', folderId);
      await chrome.storage.local.set({ mentusFolderId: folderId });
      return folderId;
    }

    // If the folder doesn't exist, create it
    console.log('Mentus Workspace folder not found, creating a new one');
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Mentus Workspace',
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const folder = await createResponse.json();
    console.log('New Mentus Workspace folder created:', folder.id);
    await chrome.storage.local.set({ mentusFolderId: folder.id });
    return folder.id;
  } catch (error) {
    console.error('Error ensuring Mentus Workspace folder:', error);
    throw error;
  }
}

// Implement saveToGitHub function
async function saveToGitHub(content) {
  console.log('Saving session to GitHub');
  const token = await window.getGitHubToken();

  if (!token) {
    alert('GitHub token not available. Please connect your GitHub account.');
    return;
  }

  // Implement logic to commit the session file to the user's GitHub repository
  // This involves interacting with the GitHub API to create or update files in a repository

  // Example code (simplified and needs to be adapted):
  const owner = 'your-username'; // Or get from user input or GitHub API
  const repo = 'your-repo'; // Or get from user input or settings
  const path = `sessions/${currentSession.name}.md`;
  const message = `Add session ${currentSession.name}`;
  const contentEncoded = btoa(content);

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: contentEncoded
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`GitHub API Error: ${errorData.message}`);
    }

    console.log('Session saved to GitHub');
  } catch (error) {
    console.error('Error saving session to GitHub:', error);
    alert(`Failed to save the session to GitHub. Error: ${error.message}\nPlease check your GitHub connection and try again.`);
  }
}

