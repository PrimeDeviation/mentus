document.addEventListener("DOMContentLoaded", function() {
    const chatContainer = document.getElementById("chat-container");
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.placeholder = "Type your message here...";
    chatContainer.appendChild(inputField);

    inputField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const message = inputField.value;
            if (message.trim() !== "") {
                // Handle sending the message
                console.log("Message sent: " + message);
                inputField.value = "";
            }
        }
    });
});
