#!/bin/bash

# Navigate to the backend directory and install dependencies
cd src/chat-interface/backend
npm install

# Navigate to the frontend directory and install dependencies
cd ../frontend
npm install

# Run the tests
npm test
