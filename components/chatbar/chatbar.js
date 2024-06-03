document.getElementById('sendButton').addEventListener('click', function() {
    const message = document.getElementById('chatInput').value;
    if (message) {
        console.log('Sending message:', message);
        // Add your message sending logic here
    }
});
