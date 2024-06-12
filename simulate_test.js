// Simulate setting API keys in local storage
localStorage.setItem('openaiApiKey', 'test-openai-api-key');
localStorage.setItem('anthropicApiKey', 'test-anthropic-api-key');

// Simulate loading the settings page
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadChatModels();
});

function loadSettings() {
    document.getElementById('openai-api-key').value = localStorage.getItem('openaiApiKey') || '';
    document.getElementById('anthropic-api-key').value = localStorage.getItem('anthropicApiKey') || '';
}

function loadChatModels() {
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const anthropicApiKey = localStorage.getItem('anthropicApiKey');
    const chatModelsDropdown = document.getElementById('chat-models');

    // Clear existing options
    chatModelsDropdown.innerHTML = '<option value="">Select a model</option>';

    if (openaiApiKey) {
        // Fetch OpenAI models (mocked for this example)
        const openaiModels = ['text-davinci-003', 'text-curie-001'];
        openaiModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            chatModelsDropdown.appendChild(option);
        });
    }

    if (anthropicApiKey) {
        // Fetch Anthropic models (mocked for this example)
        const anthropicModels = ['claude-v1', 'claude-v2'];
        anthropicModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            chatModelsDropdown.appendChild(option);
        });
    }
}
