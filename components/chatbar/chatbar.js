document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
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

        const message = chatInput.value.trim();
        if (message !== '') {
            displayMessage('You', message);
            chatInput.value = '';
            showLoadingIndicator();
            fetch('https://api.example.com/gpt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                hideLoadingIndicator();
                displayMessage('Bot', data.response);
            })
            .catch(error => {
                hideLoadingIndicator();
                displayMessage('Error', 'Failed to get a response from the server.');
            });
        } else {
            alert('Message cannot be empty.');
        }
    }

    function showLoadingIndicator() {
        document.getElementById('loading-indicator').style.display = 'block';
    }

    function hideLoadingIndicator() {
        document.getElementById('loading-indicator').style.display = 'none';
    }
