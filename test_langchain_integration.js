const { LangChain } = require('langchain');

const langChain = new LangChain({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

function testLangChainIntegration() {
  const message = "Hello, how are you?";
  const selectedModel = 'gpt-4o'; // Change this to 'claude-3-opus' to test the other model

  if (selectedModel === 'gpt-4o') {
    langChain.apiKey = process.env.OPENAI_API_KEY;
  } else if (selectedModel === 'claude-3-opus') {
    langChain.apiKey = process.env.ANTHROPIC_API_KEY;
  }
  langChain.setModel(selectedModel);
  langChain.query(message).then(response => {
    console.log('Bot:', response);
  });
}

testLangChainIntegration();
