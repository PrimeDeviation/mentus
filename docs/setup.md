# Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/PrimeDeviation/mentus.git
   cd mentus
   \`\`\`

2. Install dependencies for the backend:
   \`\`\`
   cd src/chat-interface/backend
   npm install
   \`\`\`

3. Install dependencies for the frontend:
   \`\`\`
   cd ../frontend
   npm install
   \`\`\`

## Running the Development Server

1. Start the backend server:
   \`\`\`
   cd src/chat-interface/backend
   npm start
   \`\`\`

2. Start the frontend development server:
   \`\`\`
   cd ../frontend
   npm start
   \`\`\`

3. Open your browser and navigate to `http://localhost:9000` to view the application.

## Building the Project

To build the frontend for production, run:
\`\`\`
cd src/chat-interface/frontend
npm run build
\`\`\`

The built files will be located in the `dist` directory.
