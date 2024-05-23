const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post('/api/message', (req, res) => {
  const { message } = req.body;
  const response = `Simulated response for: ${message}`;
  res.json({ response });
});

app.listen(port, () => {
  console.log(`Test backend server is running on http://localhost:${port}`);
});
