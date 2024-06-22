
# Mentus Knowledge Instructor Architecture

## Overview
Mentus is a Chrome extension designed to curate learning content, validate user learning, and track user-generated content. The UI consists of a full browser window tab with a chat bar on the left, a tabbed navigation at the top, and a central content area for displaying selected features such as graph view, documents/files, editor, or settings. The layout is horizontally drag-adjustable, allowing users to customize the screen segmentation. Any links clicked within the graph UI will open in a new browser window or tab.

## Components
### Chat Bar
- Located on the left side of the screen.
- Supports user interactions and displays chat messages.
- Each chat session is persisted as a markdown (md) file.

### Tabbed Navigation
- Located at the top of the screen.
- Allows navigation to different sections: graph view, documents/files, editor, settings.

### Central Content Area
- Located in the center of the screen.
- Displays different features: graph view, documents/files, editor, settings.
- Layout is horizontally drag-adjustable.

### Graph View
- Displays the knowledge graph based on the markdown files.
- Nodes represent markdown files (chat sessions).
- Edges represent links between markdown files.
- Clicking on nodes allows editing of the corresponding markdown file.

### Documents/Files
- Allows users to view and manage markdown files as a file system.
- Represents the same data as the Graph View but in a traditional file structure.

### Editor
- Provides a functional text editor for user-generated content.
- Allows editing of markdown files, which updates both the file system and the graph representation.

### Settings
- Allows users to configure the extension settings.

## Data Flow and Integration
- Chat sessions are saved as markdown files.
- These markdown files are the basis for both the file system in the Documents tab and the graph in the Graph View tab.
- Editing a file in the Documents tab, a node in the Graph View, or directly in the Editor tab updates the underlying markdown file and reflects changes across all views.

## Storage and Data Management
- Markdown files are stored locally and managed using the extension's storage mechanisms.
- Graph structure is derived from the markdown files' content and links.

## External API Integration
- Interacts with external APIs (e.g., GPT-4, Claude 3 Opus) to provide chat functionality and potentially assist in knowledge graph construction.

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
- Use efficient algorithms and data structures, especially for graph operations.
- Implement lazy loading for large graphs or file systems.
- Avoid memory leaks by cleaning up event listeners and intervals.

## Tasks
- Implement markdown file creation and storage from chat sessions.
- Develop a file system viewer for the Documents tab.
- Create a graph visualization component for the Graph View tab.
- Implement a markdown editor with live preview.
- Ensure synchronization between all views (Documents, Graph, Editor).
- Verify file paths in manifest.json.
- Check for missing permissions in manifest.json.
- Ensure all components are integrated and functional.
- Test external API integration.
- Test storage and data management.

## File Structure
mentus/
├── manifest.json
├── background.js
├── service-worker.js
├── content-scripts/
│   ├── content-script.js
│   └── content-style.css
├── images/
│   ├── icon_16.png
│   ├── icon_48.png
│   └── icon_128.png
├── styles/
│   └── main.css
└── components/
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
    └── userprofile/
        ├── userprofile.html
        ├── userprofile.js
        └── userprofile.css

