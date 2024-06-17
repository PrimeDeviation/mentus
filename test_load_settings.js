// Set API keys in local storage
localStorage.setItem('openaiApiKey', 'test-openai-api-key');
localStorage.setItem('anthropicApiKey', 'test-anthropic-api-key');

// Load the settings page
window.location.href = 'test_settings.html';

// Print the loaded settings
window.addEventListener('load', function() {
    console.log('OpenAI API Key:', document.getElementById('openai-api-key-value').textContent);
    console.log('Anthropic API Key:', document.getElementById('anthropic-api-key-value').textContent);
});
