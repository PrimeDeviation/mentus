import React, { useState } from 'react';
import './styles/App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, input]);
      try {
        const response = await fetch('http://localhost:3001/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
        });
        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, data.response]);
      } catch (error) {
        console.error('Error:', error);
      }
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-display">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button type="submit" className="chat-submit">Send</button>
      </form>
    </div>
  );
}

export default App;
