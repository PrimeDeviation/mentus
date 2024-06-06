document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');

  if (chatInput && sendButton && chatMessages) {
    console.log('Elements found successfully.');

    sendButton.addEventListener('click', function() {
      console.log('Send button clicked.');
    });

    chatInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        console.log('Enter key pressed in chat input.');
      }
    });
  } else {
    console.error('One or more elements not found.');
  }
});
