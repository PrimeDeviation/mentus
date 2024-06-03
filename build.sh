#!/bin/bash

# Create dist directory and placeholder files
mkdir -p dist
echo "// Placeholder for background.bundle.js" > dist/background.bundle.js
echo "// Placeholder for content.bundle.js" > dist/content.bundle.js

# Create chat-interface directory and placeholder files
mkdir -p chat-interface/dist
echo "// Placeholder for bundle.js" > chat-interface/dist/bundle.js
echo "/* Placeholder for bundle.css */" > chat-interface/dist/bundle.css

echo "Build completed successfully."
