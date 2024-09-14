# Diagram Tab

## Purpose

The Diagram Tab is a new component of the Mentus Chrome extension that integrates Excalidraw, a virtual whiteboard for sketching hand-drawn like diagrams. This tab allows users to create, edit, and save diagrams directly within the extension, enhancing the visual learning and note-taking experience.

## Features

1. **Excalidraw Integration**
   - Embed the Excalidraw library to provide a full-featured diagramming experience.
   - Support for freehand drawing, shapes, text, and other Excalidraw tools.

2. **Diagram Management**
   - Create new diagrams
   - Save diagrams to a path defined in settings (need to create the new configuration field 'Diagrams Path')
   - Load existing diagrams
   - Export diagrams in various formats (PNG, SVG, JSON) to the downloads folder

3. **Integration with Other Components**
   - Add diagram to the context of chats with visual models on request with an 'Add to Chat' button 

5. **Theme Support**
   - Adapt to the extension's light/dark mode settings

## Implementation

### Files
- `components/diagrams/diagrams.html`
- `components/diagrams/diagrams.js`
- `components/diagrams/diagrams.css`

### External Libraries
- Excalidraw (to be included in the project)

### Key Functions

1. **initializeDiagramTab()**
   - Set up the Excalidraw canvas
   - Initialize toolbar and controls

2. **createNewDiagram()**
   - Clear the canvas and start a new diagram

3. **saveDiagram()**
   - Save the current diagram state
   - Integrate with Google Drive or Obsidian for cloud storage

4. **loadDiagram(diagramId)**
   - Load a previously saved diagram onto the canvas

5. **exportDiagram(format)**
   - Export the current diagram in the specified format (PNG, SVG, JSON)

6. **linkDiagramToContent(contentId, contentType)**
   - Associate the current diagram with a chat session or document

7. **updateTheme(isDarkMode)**
   - Update the Excalidraw canvas theme based on the extension's current mode

## User Interface

The Diagram Tab should include:

1. A main canvas area for drawing
2. A toolbar with Excalidraw tools (pen, shapes, text, etc.)
3. Controls for creating new diagrams, saving, loading, and exporting
4. An option to link the diagram to other content in the extension

## Integration with Existing Components

1. **Chatbar**: Allow users to reference or insert diagrams into chat sessions
2. **Documents**: Enable saving of diagrams to the diagram path by default, open diagrams in the diagram tab
4. **Settings**: Add diagram-related settings (e.g., default save location, auto-save frequency)

## Future Enhancements

1. AI-assisted diagramming (e.g., generating diagrams from text descriptions)
2. Template library for common diagram types
3. Version history for diagrams
4. Advanced collaboration features (e.g., real-time multi-user editing)

## Technical Considerations

1. Ensure proper loading and initialization of the Excalidraw library
2. Handle diagram data serialization for saving and loading
3. Implement efficient storage and retrieval of diagrams, especially for large numbers of diagrams
4. Consider performance optimizations for smooth drawing experience
5. Ensure proper error handling and user feedback for all diagram operations