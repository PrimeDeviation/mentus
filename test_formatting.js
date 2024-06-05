document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');

    function testMessageFormatting() {
        const testCases = [
            { input: '**bold**', expected: '<strong>bold</strong>' },
            { input: '_italics_', expected: '<em>italics</em>' },
            { input: '[link](http://example.com)', expected: '<a href="http://example.com">link</a>' }
        ];

        testCases.forEach(testCase => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            let message = testCase.input
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
                .replace(/_(.*?)_/g, '<em>$1</em>')                // Italics
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');  // Links

    <script src="components/chatbar/chatbar.js"></script>
    <script src="test_formatting.js"></script>
    <script src="components/chatbar/chatbar.js"></script>
    <script src="test_formatting.js"></script>

            console.assert(messageElement.innerHTML === testCase.expected, `Test failed for input: ${testCase.input}`);
        });

        console.log("All tests completed.");
    }

    testMessageFormatting();
});
