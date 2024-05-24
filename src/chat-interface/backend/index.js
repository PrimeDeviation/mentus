const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/api/message', (req, res) => {
  const { message } = req.body;
  // Here we would integrate LangChain to generate a response
  const response = `You said: ${message}`;
  res.json({ response });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
