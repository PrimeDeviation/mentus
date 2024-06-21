# Mentus Knowledge Instructor

A Chrome extension to tutor students and maintain a graphical knowledge ontology.

## Installation

### From Source

1. Clone the repository:
    ```sh
    git clone https://github.com/PrimeDeviation/mentus.git
    ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the top right.

4. Click "Load unpacked" and select the cloned directory.

### From Release

1. Download the latest release `chrome-extension.tar.gz` from the [releases page](https://github.com/PrimeDeviation/mentus/releases).

2. Extract the contents of the tar.gz file:
    ```sh
    tar -xzvf chrome-extension.tar.gz
    ```

3. Open Chrome and navigate to `chrome://extensions/`.

4. Enable "Developer mode" by toggling the switch in the top right.

5. Click "Load unpacked" and select the extracted directory.

## Usage

- Open the extension by clicking on the icon in the Chrome toolbar.
- Enter a subject into the input field and click "Add Subject" to add it.
- The popup files are located in the `src/chrome-extension/src/popup` directory.

## Architecture

### Overview
Mentus is a Chrome extension designed to curate learning content, validate user learning, and track user-generated content. The UI consists of a full browser window tab with a chat bar on the left, a tabbed navigation at the top, and a central content area for displaying selected features such as graph view, documents/files, editor, or settings. The layout is horizontally drag-adjustable, allowing users to customize the screen segmentation. Any links clicked within the graph UI will open in a new browser window or tab.

### Components
#### Chat Bar
- Located on the left side of the screen.
- Supports user interactions and displays chat messages.
- Each chat session is persisted as a markdown (md) file.

#### Tabbed Navigation
- Located at the top of the screen.
- Allows navigation to different sections: graph view, documents/files, editor, settings.

#### Central Content Area
- Located in the center of the screen.
- Displays different features: graph view, documents/files, editor, settings.
- Layout is horizontally drag-adjustable.

#### Graph View
- Displays the knowledge graph based on the markdown files.
- Nodes represent markdown files (chat sessions).
- Edges represent links between markdown files.
- Clicking on nodes allows editing of the corresponding markdown file.

#### Documents/Files
- Allows users to view and manage markdown files as a file system.
- Represents the same data as the Graph View but in a traditional file structure.

#### Editor
- Provides a functional text editor for user-generated content.
- Allows editing of markdown files, which updates both the file system and the graph representation.

#### Settings
- Allows users to configure the extension settings.

### Data Flow and Integration
- Chat sessions are saved as markdown files.
- These markdown files are the basis for both the file system in the Documents tab and the graph in the Graph View tab.
- Editing a file in the Documents tab, a node in the Graph View, or directly in the Editor tab updates the underlying markdown file and reflects changes across all views.

### Storage and Data Management
- Markdown files are stored locally and managed using the extension's storage mechanisms.
- Graph structure is derived from the markdown files' content and links.

### External API Integration
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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
