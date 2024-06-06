document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chat-input'); // Ensure this matches the ID in your HTML
  
  // Sample messages to demonstrate functionality
  const messages = [
    "Hello, how can I assist you today?",
    "What are your learning goals?",
    "Let's explore some educational concepts together."
  ];

  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
  });
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

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
            // Simulate receiving a response
            setTimeout(function() {
                displayMessage('Bot', 'This is a response message.');
            }, 1000);
        }
    }

    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        // Parse markdown-like syntax
        message = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/_(.*?)_/g, '<em>$1</em>')                // Italics
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');  // Links

        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
