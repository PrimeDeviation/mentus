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
   - **Features**:
     - **Session Management**: Start, save, and load chat sessions.
     - **Model Selection**: Choose between different chat models.
     - **Message Handling**: Add messages to the chat UI and handle user interactions.

2. **Documents**
   - **Purpose**: Manages documents, including integration with Google Drive and Obsidian.
   - **Files**:
     - `components/documents/documents.html`
     - `components/documents/documents.js`
     - `components/documents/documents.css`
   - **Features**:
     - **Document List**: Display a list of documents.
     - **File Tree**: Visualize the file structure.
     - **Document Interaction**: Open, edit, and manage documents.

3. **Editor**
   - **Purpose**: Provides a markdown editor for creating and editing documents.
   - **Files**:
     - `components/editor/editor.html`
     - `components/editor/editor.js`
     - `components/editor/editor.css`
     - `components/editor/obsidian-theme.js`
   - **Features**:
     - **Markdown Editing**: Full-featured markdown editor.
     - **File Management**: Create, save, and manage files.
     - **Syntax Highlighting**: Support for various programming languages.
     - **Dark Mode**: Support for dark mode themes.

4. **Graphview**
   - **Purpose**: Visualizes the knowledge graph representing the learner's journey.
   - **Files**:
     - `components/graphview/graphview.html`
     - `components/graphview/graphview.js`
     - `components/graphview/graphview.css`
   - **Features**:
     - **Interactive Graph Controls**: Users can adjust various graph parameters such as link force, link distance, link opacity, link width, and node size using sliders.
     - **Dark Mode Support**: The graph view updates its colors based on the current theme (dark or light mode).
     - **Dynamic Data Fetching**: Fetches graph data from the Mentus API and merges it with existing Obsidian data.
     - **Graph Fitting**: Automatically fits the graph to the container for optimal viewing.
     - **Loading Messages**: Displays loading messages while fetching and processing graph data.
     - **Cache Management**: Clears and manages the link cache to ensure up-to-date data.
     - **Event Listeners**: Includes event listeners for various user interactions and settings adjustments.
     - **Error Handling**: Logs errors and provides feedback if data fetching or processing fails.
     - **Graph Initialization**: Initializes the graph with nodes and links, and logs the number of nodes and links rendered.
     - **Graph Controls**: Provides sliders for adjusting text fade, node size, link thickness, center force, repel force, link force, and link distance.

5. **Settings**
   - **Purpose**: Manages user settings, including API keys and integration settings.
   - **Files**:
     - `components/settings/settings.html`
     - `components/settings/settings.js`
     - `components/settings/settings.css`
   - **Features**:
     - **API Key Management**: Save and update API keys for various services.
     - **Settings Listeners**: Initialize and manage event listeners for settings changes.
     - **Settings Persistence**: Load and save settings to local storage.
     - **Graph Database Settings**: Manage settings specific to the graph database.

6. **User Profile**
   - **Purpose**: Manages user profile information and Google account integration.
   - **Files**:
     - `components/userprofile/userprofile.html`
     - `components/userprofile/userprofile.js`
     - `components/userprofile/userprofile.css`
   - **Features**:
     - **Profile Management**: Update and save user profile information.
     - **Google Account Integration**: Connect and disconnect Google accounts.
     - **Form Handling**: Manage form inputs and display current values.

### Utility Scripts

- **Authentication**
  - **Purpose**: Manages Google authentication and token handling.
  - **Files**:
    - `utils/auth.js`
  - **Features**:
    - **Token Management**: Handle Google OAuth tokens.
    - **Authentication Flow**: Manage the authentication process with Google.

### Styles

- **Main Stylesheet**
  - **Purpose**: Provides global styles and dark mode support.
  - **Files**:
    - `styles/main.css`
  - **Features**:
    - **Global Styles**: Define global styles for the extension.
    - **Dark Mode**: Support for dark mode themes.

### Manifest

- **Manifest File**
  - **Purpose**: Defines the extension's metadata, permissions, and background scripts.
  - **Files**:
    - `manifest.json`
  - **Features**:
    - **Metadata**: Define the extension's name, version, and description.
    - **Permissions**: Specify the permissions required by the extension.
    - **Background Scripts**: Define background scripts and their roles.

### Background Script

- **Background Script**
  - **Purpose**: Handles background tasks and authentication.
  - **Files**:
    - `background.js`
  - **Features**:
    - **Background Tasks**: Manage background tasks for the extension.
    - **Authentication**: Handle authentication processes in the background.

## Key Features

1. **Chat Sessions**: Users can interact with multimodal agents like GPT-4 and Claude 3 Opus. Sessions can be saved and loaded, with support for both Google Drive and Obsidian.
2. **Document Management**: Users can manage documents stored in Google Drive or Obsidian, with support for creating, editing, and viewing documents.
3. **Knowledge Graph**: Visualizes the learner's journey within a knowledge graph, helping users understand their progress and connections between topics.
4. **User Profile**: Manages user profile information and integrates with Google accounts for authentication and document access.
5. **Settings**: Allows users to configure API keys and integration settings for OpenAI, Anthropic, and Obsidian.
6. **Image Upload for Visual Models**: Users can upload images when using visual models like Claude 3.5 Sonnet, Claude 3 Opus, and GPT-4 Vision. The feature includes:
   - Dynamic display of an image upload button based on the selected model's capabilities.
   - Image preview in the chat history.
   - Proper formatting and sending of image data to both OpenAI and Anthropic APIs.
   - Responsive design to fit images within the resizable chat bar.

