# Agents Design for Mentus Chrome Extension

## Overview

The Mentus Chrome extension is being enhanced to incorporate intelligent agents using LangChain/LangGraph. These agents will enable advanced functionalities such as context-aware interactions, cognitive reasoning, objective validation, and more. This document outlines the design and responsibilities of each agent.

## Agents

### 1. AtAgent

**Purpose**: 
- AtAgent is responsible for incorporating context from Obsidian vaults, Google Docs files, and graphdb data into chat sessions and other components via embeddings and ontology linking.

**Features**:
- **@Mention Context Inclusion**: Supports embedded referencing and context inclusion when users mention documents or nodes.
- **Embedding Integration**: Utilizes embeddings for semantic understanding of mentioned content.
- **Ontology Linking**: Leverages graph database ontology to link relevant information pieces.
- **Context Injection**: Automatically injects relevant context into user queries in chat sessions or editor.

**Tasks**:
- Monitor @mentions in chat sessions and editor.
- Retrieve and embed content from Obsidian, Google Docs, and graphdb.
- Inject retrieved context seamlessly into interactions.

### 2. EyeAgent

**Purpose**:
- EyeAgent enhances context awareness by monitoring and capturing the state of other open windows and tabs in the browser.

**Features**:
- **Tab Context Awareness**: Keeps track of URLs, titles, and statuses of other open tabs.
- **Screenshot Capture**: Takes periodic screenshots of open tabs for visual context.
- **Active Window Monitoring**: Detects and logs active windows to understand user focus and workflow.

**Tasks**:
- Capture metadata and screenshots of open tabs.
- Store the captured data for context-aware reasoning.
- Provide visual context for other agents to use in their operations.

### 3. Sys2Agent

**Purpose**:
- Sys2Agent facilitates CoT (Chain of Thought) reasoning patterns by configuring templates that incorporate various contexts into goal-directed cognitive processes.

**Features**:
- **Template Configurations**: Uses predefined templates to guide reasoning processes.
- **CoT Reasoning**: Enables step-by-step structured thinking using collected contexts.
- **Goal-Directed Processes**: Helps achieve specific user-defined goals by iterating through reasoning steps.

**Tasks**:
- Define and manage reasoning templates.
- Collect and integrate context from different tabs, documents, and chats.
- Execute reasoning steps and provide goal-directed guidance.

### 4. ValidAgent

**Purpose**:
- ValidAgent checks the outputs of processes to determine if objectives have been met or goals achieved, providing feedback for iterative improvement.

**Features**:
- **Objective Validation**: Assesses whether specific objectives have been achieved.
- **Goal Feedback**: Provides comprehensive feedback to other agents for goal refinement.
- **OODA Loop Support**: Enables Observe-Orient-Decide-Act loop iterations by validating and refining actions.

**Tasks**:
- Validate the outputs against predetermined objectives.
- Provide feedback and suggestions for improvement.
- Record validation results for outcome tracking.

## Integration

### AtAgent Integration
- Integrates with chat sessions, the editor, and documents to provide context via @mentions.
- Utilizes APIs to fetch, embed, and integrate content into user interactions.

### EyeAgent Integration
- Monitors browser activities, captures screenshots, and stores the state of tabs.
- Works in the background to provide visual context for cognitive reasoning.

### Sys2Agent Integration
- Interacts with chat, documents, diagrams, and other tabs to gather context.
- Uses collected context for step-by-step reasoning and goal achievement.

### ValidAgent Integration
- Validates outputs from chat sessions, editor content, and cognitive reasoning processes.
- Provides iterative feedback loops to enhance the performance of other agents.

## Implementation Plan

1. **Design API Interfaces**:
   - Define API endpoints for embedding retrieval, tab monitoring, and validation.
   - Set up secure communication channels between agents and the Mentus extension backend.

2. **Develop Agent Logic**:
   - Implement core functions for each agent.
   - Test individual agent functionalities in isolation.

3. **Integrate Agents**:
   - Connect agents to chat sessions, documents, and other components.
   - Ensure seamless interaction and data flow between agents.

4. **Validate and Optimize**:
   - Run validation tests to ensure agents meet their objectives.
   - Optimize agent performance and resource utilization.

5. **Deploy and Monitor**:
   - Deploy the enhanced Mentus extension with integrated agents.
   - Continuously monitor agent performance and iterate based on user feedback and validation results.

## Future Enhancements

- **Enhanced Collaboration**: Enable real-time collaboration features for diagram and document editing.
- **Advanced Reasoning**: Incorporate more complex reasoning templates for Sys2Agent.
- **Contextual Learning**: Allow agents to learn from user interactions and improve over time.

This ongoing design will evolve as the agents are developed, tested, and integrated into the Mentus Chrome extension. Feedback and further requirements will be incorporated into future iterations.