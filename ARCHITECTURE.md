mentus/
├── manifest.json
├── background.js
├── service-worker.js
├── content-scripts/
│   ├── content-script.js
│   └── content-style.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── styles/
│   └── main.css
└── components/
    ├── navbar/
    │   ├── navbar.html
    │   ├── navbar.js
    │   └── navbar.css
    ├── chatbar/
    │   ├── chatbar.html
    │   ├── chatbar.js
    │   └── chatbar.css
    ├── graphview/
    │   ├── graphview.html
    │   ├── graphview.js
    │   └── graphview.css
    ├── documents/
    │   ├── documents.html
    │   ├── documents.js
    │   └── documents.css
    ├── editor/
    │   ├── editor.html
    │   ├── editor.js
    │   └── editor.css
    └── settings/
        ├── settings.html
        ├── settings.js
        └── settings.css
# Mentus Knowledge Instructor Architecture

## Overview

Mentus is a Chrome extension designed to curate learning content, validate user learning, and track user-generated content. The UI consists of a full browser window tab with a navigation bar on the left, a chat bar on the right, and a central content area for displaying selected features such as graph view, documents/files, editor, or settings. The layout is horizontally drag-adjustable, allowing users to customize the screen segmentation. Any links clicked within the graph UI will open in a new browser window or tab.

## Components

### Navigation Bar
- Located on the left side of the screen.
- Allows navigation to different sections: graph view, documents/files, editor, settings.

### Chat Bar
- Located on the right side of the screen.
- Supports user interactions and displays chat messages.

### Central Content Area
- Located in the center of the screen.
- Displays different features: graph view, documents/files, editor, settings.
- Layout is horizontally drag-adjustable.

### Graph View
- Displays the knowledge graph.
- Clicking on links opens them in a new browser window or tab.

### Documents/Files
- Allows users to view and manage documents/files.

### Editor
- Provides a functional text editor for user-generated content.

### Settings
- Allows users to configure the extension settings.

## Storage and Data Management
- User data is stored and managed using localStorage or other storage mechanisms.

## External API Integration
- Interacts with external APIs (e.g., GPT-4, Claude 3 Opus) to provide additional functionality.

## File Structure
- `manifest.json`: Configuration file for the Chrome extension.
- `background.js`: Background script for the extension.
- `content-scripts/`: Directory containing content scripts.
- `components/`: Directory containing UI components (chatbar, documents, editor, graphview, navbar, settings).
- `popup/`: Directory containing files for the popup UI.
- `src/chat-interface/`: Directory containing the chat interface implementation.

## Coding Standards

- Follow JavaScript ES6+ standards.
- Use meaningful variable and function names.
- Keep functions small and focused on a single task.
- Use consistent indentation (2 spaces).
- Avoid global variables; use modules and closures.

## Documentation Standards

- Use JSDoc comments for all functions and classes.
- Include descriptions, parameter types, and return types in JSDoc comments.
- Keep comments up-to-date with code changes.

## Testing Guidelines

- Write unit tests for all functions and components.
- Use a testing framework like Jest.
- Ensure tests cover edge cases and error conditions.
- Run tests before committing code.

## Performance Optimization

- Minimize DOM manipulations.
- Optimize CSS for better performance.
- Use efficient algorithms and data structures.
- Avoid memory leaks by cleaning up event listeners and intervals.

## Tasks
- Verify file paths in `manifest.json`.
- Check for missing permissions in `manifest.json`.
- Ensure all components are integrated and functional.
- Test external API integration.
- Test storage and data management.
