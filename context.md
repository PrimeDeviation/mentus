# Mentus Chrome Extension

## Purpose

The Mentus Chrome extension is designed to tutor students by interfacing with a multimodal agent (e.g., GPT-4, Claude 3 Opus). It maintains a graphical knowledge ontology with a node-based representation of the learner's journey within the knowledge graph. The extension provides various functionalities, including chat sessions, document management, and user profile management.

## Architecture

The Mentus Chrome extension is structured into several components, each responsible for different functionalities. Below is an overview of the main components and their roles:

### Components

1. **Chatbar**
   - **Purpose**: Manages chat sessions with the multimodal agent.
   - **Files**:
     - `components/mentus_tab.html`
     - `components/mentus_tab.js`
     - `components/chatbar/chatbar.js`
     - `components/chatbar/chatbar.css`

2. **Documents**
   - **Purpose**: Manages documents, including integration with Google Drive and Obsidian.
   - **Files**:
     - `components/documents/documents.html`
     - `components/documents/documents.js`
     - `components/documents/documents.css`

3. **Editor**
   - **Purpose**: Provides a markdown editor for creating and editing documents.
   - **Files**:
     - `components/editor/editor.html`
     - `components/editor/editor.js`
     - `components/editor/editor.css`
     - `components/editor/obsidian-theme.js`

4. **Graphview**
   - **Purpose**: Visualizes the knowledge graph representing the learner's journey.
   - **Files**:
     - `components/graphview/graphview.js`
     - `components/graphview/graphview.css`

5. **Settings**
   - **Purpose**: Manages user settings, including API keys and integration settings.
   - **Files**:
     - `components/settings/settings.html`
     - `components/settings/settings.js`
     - `components/settings/settings.css`

6. **User Profile**
   - **Purpose**: Manages user profile information and Google account integration.
   - **Files**:
     - `components/userprofile/userprofile.html`
     - `components/userprofile/userprofile.js`
     - `components/userprofile/userprofile.css`

### Utility Scripts

- **Authentication**
  - **Purpose**: Manages Google authentication and token handling.
  - **Files**:
    - `utils/auth.js`

### Styles

- **Main Stylesheet**
  - **Purpose**: Provides global styles and dark mode support.
  - **Files**:
    - `styles/main.css`

### Manifest

- **Manifest File**
  - **Purpose**: Defines the extension's metadata, permissions, and background scripts.
  - **Files**:
    - `manifest.json`

### Background Script

- **Background Script**
  - **Purpose**: Handles background tasks and authentication.
  - **Files**:
    - `background.js`

## Key Features

1. **Chat Sessions**: Users can interact with multimodal agents like GPT-4 and Claude 3 Opus. Sessions can be saved and loaded, with support for both Google Drive and Obsidian.
2. **Document Management**: Users can manage documents stored in Google Drive or Obsidian, with support for creating, editing, and viewing documents.
3. **Knowledge Graph**: Visualizes the learner's journey within a knowledge graph, helping users understand their progress and connections between topics.
4. **User Profile**: Manages user profile information and integrates with Google accounts for authentication and document access.
5. **Settings**: Allows users to configure API keys and integration settings for OpenAI, Anthropic, and Obsidian.

## License

The Mentus Chrome extension is licensed under the MIT License. See the `LICENSE` file for more information.

# Mentus Extension Development Guidelines

## Prime Directives
1. First, do no harm: Never modify existing functional code unless explicitly requested.
2. Maintain backwards compatibility at all costs.
3. Prioritize stability over new features.

## Development Approach
1. Always suggest isolated additions rather than modifications to existing code.
2. Provide clear warnings about potential impacts for any suggested changes.
3. Verify the current state of functionality before proposing any modifications.
4. Focus on incremental improvements that build upon existing functionality.

## Key Components
- Chatbar: Manages chat sessions with multimodal agents.
- Documents: Handles document management and integration with Google Drive and Obsidian.
- Graph View: Visualizes knowledge ontology and learner's journey.
- Settings: Manages user settings and API configurations.

## Critical Reminders
- The Obsidian integration is sensitive to path configurations. Always use the correct setting names.
- The chat session functionality is a core feature. Treat it with extra care.
- The graph view is a new feature. Ensure it doesn't interfere with existing components.

## Testing
- Always suggest testing steps for any proposed changes.
- Prioritize testing of core functionalities after any modification.