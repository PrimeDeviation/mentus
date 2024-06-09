document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const modelDropdown = document.getElementById('model-dropdown');

  // Initialize LangChain
  const langChain = new LangChain({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
  });

  sendButton.addEventListener('click', function() {
    sendMessage();
  });

  chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message !== '') {
      displayMessage('You', message);
      chatInput.value = '';
      const selectedModel = modelDropdown.value;
      if (selectedModel === 'gpt-4o') {
        langChain.apiKey = process.env.OPENAI_API_KEY;
      } else if (selectedModel === 'claude-3-opus') {
        langChain.apiKey = process.env.ANTHROPIC_API_KEY;
      }
      langChain.setModel(selectedModel);
      langChain.query(message).then(response => {
        displayMessage('Bot', response);
      });
    }
  }

  function displayMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
