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

// 1. Add variables to store mention suggestions
let mentionSuggestions = [];

// Initialize the Mentus Tab
async function initializeMentusTab() {
  try {
    console.log('Initializing Mentus Tab');
    initializeTabButtons();
    console.log('Tab buttons initialized');
    initializeDraggableResizer();
    initializeDarkModeToggle();
    console.log('Dark mode toggle initialized');

    // Load settings first
    if (window.settingsModule) {
      console.log('Loading existing settings');
      await window.settingsModule.loadExistingSettings();
      console.log('Initializing settings listeners');
      window.settingsModule.initializeSettingsListeners();
    } else {
      console.error('Settings module not found');
    }

    // Load chat models after settings are loaded
    console.log('About to load chat models');
    await loadChatModels();
    console.log('Chat models loaded');

    // Initialize Obsidian
    console.log('Initializing Obsidian');
    await initializeObsidian();
    console.log('Obsidian initialized');

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

    initializeChatListeners();
    console.log('Chat listeners initialized');
    initializeDocumentsListeners();
    console.log('Document listeners initialized');
    initializeSessionListeners();
    console.log('Session listeners initialized');

    if (!currentSession.id) {
      console.log('Starting new session');
      await startNewSession();
    }

    // Show the settings tab by default
    showTab('settings');
    console.log('Settings tab displayed');

    console.log('Mentus Tab initialization complete');
  } catch (error) {
    console.error('Error in initializeMentusTab:', error);
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
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

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

// Show a specific tab
function showTab(tabName) {
  console.log(`Showing tab: ${tabName}`);
  
  const tabContents = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-button');

  tabContents.forEach(content => content.style.display = 'none');
  tabButtons.forEach(button => button.classList.remove('active'));

  const activeTab = document.getElementById(tabName);
  const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);

  if (activeTab && activeButton) {
    activeTab.style.width = '100%';
    activeTab.style.display = 'block';
    activeButton.classList.add('active');
    console.log(`Tab ${tabName} is now visible`);

    // Additional logic for specific tabs
    if (tabName === 'docs') {
      if (typeof window.showDocumentsTab === 'function') {
        window.showDocumentsTab();
      }
    } else if (tabName === 'editor') {
      if (typeof window.editorModule !== 'undefined' && typeof window.editorModule.ensureEditorInitialized === 'function') {
        window.editorModule.ensureEditorInitialized();
      }
    } else if (tabName === 'graph') {
      console.log("Graph tab selected");
      let graphContainer = document.getElementById('graph-container');
      if (!graphContainer) {
        graphContainer = document.createElement('div');
        graphContainer.id = 'graph-container';
        document.getElementById('graph').appendChild(graphContainer);
      }
      if (typeof window.checkGraphStatus === 'function') {
        console.log("Calling checkGraphStatus");
        window.checkGraphStatus();
      } else {
        console.error('checkGraphStatus function not found');
      }
    }
  } else {
    console.error(`Tab content or button not found for: ${tabName}`);
  }
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

// 2. Update the initializeChatListeners function to add event listeners for mentions
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

    // Add event listener for input changes to handle @mentions
    chatInput.addEventListener('input', handleChatInput);
    
    // Hide suggestions when clicking outside the chat input
    document.addEventListener('click', (e) => {
        const suggestionList = document.getElementById('mention-suggestions');
        if (suggestionList && !suggestionList.contains(e.target) && e.target !== chatInput) {
            hideMentionSuggestions();
        }
    });

    if (imageAttachButton) {
        imageAttachButton.addEventListener('click', handleImageAttachment);
    } else {
        console.error('Image attach button not found');
    }
}

// 3. Add the handleChatInput function
async function handleChatInput(e) {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([\w\s]*)$/);

    if (mentionMatch) {
        const mentionText = mentionMatch[1];
        const suggestions = await fetchMentionSuggestions(mentionText);
        displayMentionSuggestions(suggestions, input);
    } else {
        hideMentionSuggestions();
    }
}

// 4. Update the fetchMentionSuggestions function
async function fetchMentionSuggestions(query) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

    if (!apiKey || !endpoint) {
        console.error('Obsidian API key or endpoint not set');
        alert('Obsidian API key or endpoint not set. Please check your settings.');
        return [];
    }

    try {
        // Adjust the URL to avoid double slashes
        const url = `${endpoint.replace(/\/$/, '')}/vault/`;

        console.log('Fetching mention suggestions from URL:', url);

        const response = await fetch(url, {
            headers: {
                'X-API-Auth-Token': apiKey, // Use correct header name
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Log the response status and text for debugging
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        // The API returns an object with a 'files' array
        const files = data.files || [];

        return files
            .filter(file => 
                file.toLowerCase().includes(query.toLowerCase()) && file.endsWith('.md')
            )
            .map(file => ({
                name: file.replace('.md', ''),
                path: file
            }));
    } catch (error) {
        console.error('Error fetching mention suggestions:', error);
        alert('Failed to load mention suggestions. Please check your Obsidian API settings and ensure that the Obsidian Local REST API plugin is running.');
        return [];
    }
}

// 5. Add the displayMentionSuggestions function
function displayMentionSuggestions(suggestions, input) {
    let suggestionList = document.getElementById('mention-suggestions');
    if (!suggestionList) {
        suggestionList = document.createElement('ul');
        suggestionList.id = 'mention-suggestions';
        suggestionList.className = 'mention-suggestions';
        input.parentNode.appendChild(suggestionList);
    }

    suggestionList.innerHTML = '';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion.name;
        li.className = 'suggestion-item';
        li.addEventListener('click', () => selectMention(suggestion, input));
        suggestionList.appendChild(li);
    });

    positionSuggestionList(suggestionList, input);
    suggestionList.style.display = 'block';
}

// 6. Add the positionSuggestionList function
function positionSuggestionList(list, input) {
    const rect = input.getBoundingClientRect();
    list.style.position = 'absolute';
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.bottom}px`;
    list.style.width = `${rect.width}px`;

    // Adjust the z-index if needed
    list.style.zIndex = '1000';
}

// 7. Add the hideMentionSuggestions function
function hideMentionSuggestions() {
    const suggestionList = document.getElementById('mention-suggestions');
    if (suggestionList) {
        suggestionList.style.display = 'none';
    }
}

// 8. Add the selectMention function
function selectMention(suggestion, input) {
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPosition);
    const textAfterCursor = input.value.substring(cursorPosition);
    const updatedTextBeforeCursor = textBeforeCursor.replace(/@[\w\s]*$/, `@${suggestion.name} `);
    input.value = `${updatedTextBeforeCursor}${textAfterCursor}`;
    hideMentionSuggestions();
    input.focus();

    // Set cursor position after the inserted mention
    const newCursorPosition = updatedTextBeforeCursor.length;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// 9. Modify the sendMessage function to process @mentions
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

        // New code to handle @mentions
        const processedMessage = await replaceMentionsWithFileContent(message);
        const finalMessage = processedMessage !== null ? processedMessage : message;

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
                    text: finalMessage
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
            messageContent = [{ type: "text", text: finalMessage }];
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

        // Ensure the current session remains selected in the dropdown
        const sessionDropdown = document.getElementById('saved-sessions');
        if (sessionDropdown && currentSession.id) {
            sessionDropdown.value = currentSession.id;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert(`Error sending message: ${error.message}`);
    }
}

// 10. Add the replaceMentionsWithFileContent function
async function replaceMentionsWithFileContent(messageText) {
    const mentionPattern = /@([\w\s]+)/g;
    let match;
    const processedFiles = new Set();
    let hasMentions = false;

    while ((match = mentionPattern.exec(messageText)) !== null) {
        hasMentions = true;
        const fileName = match[1].trim();
        if (!processedFiles.has(fileName)) {
            try {
                let fileContent = await fetchObsidianFileContent(fileName);

                fileContent = handleTokenLimits(fileContent);

                // Replace the mention with the file content
                const mentionPlaceholder = `@${fileName}`;
                const filePlaceholder = `\n[Start of ${fileName}]\n${fileContent}\n[End of ${fileName}]\n`;
                messageText = messageText.replace(new RegExp(mentionPlaceholder, 'g'), filePlaceholder);

                processedFiles.add(fileName);
            } catch (error) {
                console.error(`Error fetching content for ${fileName}:`, error);
            }
        }
    }

    return hasMentions ? messageText : null;
}

// 11. Update the fetchObsidianFileContent function
async function fetchObsidianFileContent(fileName) {
    try {
        const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
        const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');

        // Encode the file path
        const encodedFileName = encodeURIComponent(`${fileName}.md`);

        // Adjust the URL
        const url = `${endpoint.replace(/\/$/, '')}/vault/${encodedFileName}`;

        console.log('Fetching file content from URL:', url);

        const response = await fetch(url, {
            headers: {
                'X-API-Auth-Token': apiKey, // Use correct header
                'Accept': 'text/markdown'
            }
        });

        if (response.ok) {
            const content = await response.text();
            return content;
        } else {
            const errorText = await response.text();
            console.error(`Failed to fetch file: ${fileName}, status: ${response.status}, message: ${errorText}`);
            throw new Error(`Failed to fetch file: ${fileName}`);
        }
    } catch (error) {
        console.error('Error fetching Obsidian file content:', error);
        throw error;
    }
}

// 12. Add the handleTokenLimits and tokenize functions
function handleTokenLimits(content) {
    const maxTokens = 2000; // Adjust based on your model's token limit
    const tokens = tokenize(content);

    if (tokens.length > maxTokens) {
        // Truncate the content
        const truncatedTokens = tokens.slice(0, maxTokens);
        return truncatedTokens.join(' ') + '...';
    }

    return content;
}

function tokenize(text) {
    // Simple tokenization by splitting on whitespace
    return text.split(/\s+/);
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
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    console.log('Obsidian API Key:', apiKey ? 'Set' : 'Not set');
    console.log('Obsidian Endpoint:', endpoint);
    console.log('Obsidian Chat Path:', chatPath);

    if (!apiKey || !endpoint || !chatPath) {
      console.error('Obsidian settings are incomplete');
      return;
    }

    // Ensure the chatPath ends with a forward slash
    const formattedChatPath = chatPath.endsWith('/') ? chatPath : `${chatPath}/`;
    const url = `${endpoint.replace(/\/$/, '')}/vault/${formattedChatPath.replace(/^\//, '')}`;
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
  const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
  const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

  const url = `${endpoint.replace(/\/$/, '')}/vault/${chatPath.replace(/^\//, '')}/${session.name}`;
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

  // Check if we should save to Obsidian
  const saveToObsidian = await window.settingsModule.getSetting('save-to-obsidian');
  if (saveToObsidian) {
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
  const url = `${endpoint.replace(/\/$/, '')}/vault/${encodeURIComponent(filePath)}`;
  
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

async function saveToObsidianVault(content) {
    const apiKey = await window.settingsModule.getSetting('obsidian-api-key');
    const endpoint = await window.settingsModule.getSetting('obsidian-endpoint');
    const chatPath = await window.settingsModule.getSetting('obsidian-chat-path');

    if (!apiKey || !endpoint || !chatPath) {
        console.error('Obsidian settings are not complete');
        console.log('API Key:', apiKey ? 'Set' : 'Not set');
        console.log('Endpoint:', endpoint);
        console.log('Chat Path:', chatPath);
        alert('Obsidian settings are not complete. Please check your settings.');
        return;
    }

    const fileName = `${currentSession.name}.md`;
    const filePath = `${chatPath.replace(/^\//, '').replace(/\/$/, '')}/${fileName}`;

    console.log('Saving to Obsidian:', filePath);
    console.log('Content length:', content.length);

    try {
        const url = `${endpoint.replace(/\/$/, '')}/vault/${filePath}`;
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


