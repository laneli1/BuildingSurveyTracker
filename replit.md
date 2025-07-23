# Building Information Survey System

## Overview

This is a Flask-based web application for collecting building information through customizable surveys. The system allows users to create, manage, and respond to building-related questionnaires, with administrative capabilities for question management and response viewing.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design Preference: Clean, minimal aesthetic with light backgrounds, simple borders (2px solid #333), and dashboard-style layout similar to analytics interfaces. Prefers GmarketSans font family and light theme over dark theme.

## System Architecture

The application follows a traditional server-side rendered web architecture using Flask as the backend framework with in-memory data storage for MVP purposes.

### Architecture Decisions:
- **Problem**: Need for rapid prototyping and simple deployment
- **Solution**: Flask with server-side rendering and in-memory storage
- **Rationale**: Minimal setup, fast development cycle, easy to understand and maintain
- **Trade-offs**: Data persistence limited, scalability constraints with in-memory storage

## Key Components

### 1. Backend Framework
- **Flask Application** (`app.py`): Main server application handling routing, request processing, and business logic
- **In-memory Storage**: Survey questions and responses stored in Python data structures
- **CORS Support**: Enabled for potential frontend API consumption

### 2. Frontend Architecture
- **Server-Side Rendered Templates**: Jinja2 templates for HTML generation
- **Bootstrap CSS Framework**: Using light theme with custom styling for clean, minimal design
- **Vanilla JavaScript**: Client-side interactions without additional frameworks
- **Font Awesome Icons**: Icon library for enhanced UI
- **Custom CSS**: GmarketSans font, clean borders (2px solid #333), light backgrounds (#f9f9f9)

### 3. Page Structure
- **Main Survey Page** (`templates/index.html`): User-facing survey form
- **Admin Panel** (`templates/admin.html`): Question management interface
- **Responses View** (`templates/responses.html`): Survey results display
- **Custom Styling** (`static/css/custom.css`): Additional UI enhancements

### 4. JavaScript Modules
- **Survey Logic** (`static/js/survey.js`): Handles survey form interactions and submission
- **Admin Functions** (`static/js/admin.js`): Manages question creation and editing

## Data Flow

### Survey Response Flow:
1. User accesses main survey page
2. Frontend loads questions via AJAX from `/api/questions`
3. Questions dynamically rendered based on type (text, number, select, radio, checkbox)
4. Form submission sends responses to backend
5. Backend validates and stores responses in memory

### Admin Management Flow:
1. Admin accesses admin panel
2. Can create new questions with different types and options
3. Can modify existing questions
4. Changes immediately available to survey respondents

### Data Validation:
- Required field validation on both client and server side
- Type-specific validation (number fields, text length, etc.)
- Real-time feedback for form errors

## External Dependencies

### Frontend Libraries:
- **Bootstrap**: CSS framework for responsive design
- **Font Awesome**: Icon library for UI elements
- **jQuery/Vanilla JS**: DOM manipulation and AJAX requests

### Backend Dependencies:
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing support
- **Standard Python Libraries**: UUID generation, datetime handling, logging

### Missing Dependencies (Anticipated):
- Database system (likely PostgreSQL with Drizzle ORM)
- Session management for authentication
- Data persistence layer

## Deployment Strategy

### Current Setup:
- **Entry Point**: `main.py` imports the Flask app
- **Configuration**: Environment variables for session secrets
- **Static Assets**: Served through Flask's static file handling

### Production Considerations:
- **Database Migration**: Currently uses in-memory storage, needs persistent database
- **Authentication**: No current auth system, would need user management
- **Security**: Basic CORS and session configuration present
- **Scalability**: Single-server architecture, would need load balancing for scale

### Environment Configuration:
- Session secret configurable via `SESSION_SECRET` environment variable
- Logging configured for debugging during development
- CORS enabled for API access

## Recent Changes

### UI/UX Redesign (2025-07-23):
- Updated CSS to match clean, minimal dashboard aesthetic
- Changed from dark theme to light theme Bootstrap framework
- Implemented custom styling with GmarketSans font family
- Added consistent 2px solid #333 borders throughout the interface
- Updated navigation bar to light theme with hover effects
- Redesigned cards with clean white backgrounds and subtle shadows
- Enhanced form styling with better focus states and spacing

## Notable Features

### Question Types Supported:
- Text input fields
- Number input fields  
- Multiple choice (radio buttons)
- Multi-select (checkboxes)
- Dropdown selections

### User Experience:
- Responsive design for mobile and desktop
- Loading indicators for async operations
- Real-time form validation
- Toast notifications for user feedback
- Korean language interface
- Clean, minimal UI design with light theme
- Dashboard-style layout with bordered containers

### Administrative Capabilities:
- Dynamic question creation and management
- Response viewing and analysis
- Question type flexibility with options support
- Required field configuration