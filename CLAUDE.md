# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simplified ChatGPT-like web application built with Flask. It features a chat interface with typing indicators, local storage for chat history, and integration with LLM APIs.

## Architecture

- **Backend**: Flask application with blueprints for routing
- **Frontend**: Vanilla JavaScript with localStorage for persistence
- **LLM Integration**: Custom LLMClient for API communication
- **Templates**: Jinja2 templates for HTML rendering

## Key Components

1. **Main App** (`app.py`): Flask application factory with blueprint registration
2. **Routing** (`blueprints/pages.py`): Handles routes and API endpoints
3. **LLM Client** (`src/LLM_client.py`): Communicates with LLM APIs
4. **Frontend** (`static/js/chat.js`): Handles chat UI and interactions
5. **Templates** (`templates/chat.html`): Chat interface HTML
6. **Styling** (`static/css/style.css`): UI styling

## Development Commands

```bash
# Install dependencies
python -m pip install -r requirements.txt

# Run the application
python app.py
# Then open http://127.0.0.1:5000/chat
```

## Key Files to Modify

- Frontend structure: `templates/chat.html`
- Frontend logic: `static/js/chat.js`
- Styling: `static/css/style.css`
- Backend logic: `blueprints/pages.py` → `_simple_bot` function

## Testing

There are no automated tests in this project. Test by running the application and interacting with the chat interface.