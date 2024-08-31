// Global variables for managing sessions
let sessions = {};
let currentSession = {
  id: null,
  messages: [],
  model: null
};

// Send a message
export async function sendMessage(message, selectedModel) {
  
  const apiKey = await getApiKey(selectedModel.includes('gpt') ? 'openai-api-key' : 'anthropic-api-key');

  if (!apiKey || !selectedModel) {
    return { error: 'Error: API key is missing or invalid, or no model selected.' };
  }

  try {
    if (!currentSession.id || sessions[currentSession.id].model !== selectedModel) {
      currentSession.id = Date.now().toString();
      currentSession.model = selectedModel;
      currentSession.messages = [];
      sessions[currentSession.id] = currentSession;
    }

    currentSession.messages.push({ role: 'user', content: message });
    
    const response = await (selectedModel.includes('gpt') ? sendMessageToOpenAI : sendMessageToAnthropic)(selectedModel, apiKey, currentSession.messages);
    
    currentSession.messages.push({ role: 'assistant', content: response });
    
    return { response, currentSession, sessions };
  } catch (error) {
    console.error('Error:', error);
    return { error: `Error: ${error.message}` };
  }
}

// Update the chat session
export function updateChatSession(message, response) {
  
  if (!currentSession.id) {
    currentSession.id = Date.now().toString();
    sessions[currentSession.id] = currentSession;
  }
  currentSession.messages.push(
    { role: 'user', content: message },
    { role: 'assistant', content: response }
  );
  return currentSession;
 
}

// Save the current session
export function saveCurrentSession() {
  
  if (!currentSession.id) return;
  sessions[currentSession.id] = { ...currentSession };
  return sessions;
 
}

// Load a specific session
export function loadSession(sessionId) {
  
  const session = sessions[sessionId];
  if (!session) {
    console.error('Session not found:', sessionId);
    return null;
  }
  currentSession = { ...session };
  return currentSession;
 
}

// Start a new session
export function startNewSession() {
  
  currentSession = { id: Date.now().toString(), messages: [], model: null };
  sessions[currentSession.id] = currentSession;
  return currentSession;
 
}

// Display assistant reply
export function displayAssistantReply(reply) {
  // This function might be better implemented in the component that renders the chat
  // Placeholder implementation:
A
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message);
  }

  const data = await response.json();
  console.log('OpenAI API Response:', data);
  return data.choices[0].message.content;
  */
}

async function sendMessageToAnthropic(model, apiKey, messages) {
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, messages, max_tokens: 4000 })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API Error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log('Anthropic API Response:', data);
  return data.content[0].text;
 
}

// Add any other chat-related functions here
