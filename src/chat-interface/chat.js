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

    // Initialize Cytoscape.js
    const cyContainer = document.getElementById("cy");
    const { parseMarkdownToGraph } = require('../translation_module');
    const graphData = parseMarkdownToGraph('knowledge_ontology.md');

    const cy = cytoscape({
        container: cyContainer,
        elements: graphData,
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'background-color': '#0074D9',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 1
        }
    });
});
