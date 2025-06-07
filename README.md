# Cloud IDE

A modern,collaborative cloud IDE inspired by VS Code. Built with React/TypeScript (frontend) ,Socket.io for realtime collaboration, Express/Prisma (backend), and Monaco Editor for code editing.

## Features

- **Realtime collaboratoin**: Write code simaltaneously with friends.
- **Project Dashboard**: View, create, and manage your projects.
- **Project Access Control**: Only owners and invited members can access project details and files.
- **File Explorer**: Create, view, and edit files in a project. Sidebar navigation with collapsible folders (if supported).
- **Monaco Code Editor**: Syntax highlighting, intellisense for JS/TS, and basic support for other languages.
- **Multi-language Support**: Create files in JavaScript, TypeScript, Python, JSON, Markdown, HTML, CSS, C, C++, Java, and plain text.
- **Tabbed Editing**: (If enabled) Open multiple files in tabs for easy switching.
- **Code Runner**: Run JavaScript code directly in the editor for now ``` will be adding others too.```
- **Project Members**: Invite/remove collaborators (UI present, backend integration required).


## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (for local development, or use a cloud DB)

### 1. Clone the Repository
```
git clone <your-repo-url>
cd cloud-ide
```

### 2. Backend Setup
```
cd backend
npm install
# Configure your database in .env (see .env.example)
npx prisma migrate dev --name init
npm run dev
```
- The backend runs on `http://localhost:4000` by default.

### 3. Frontend Setup
```
cd frontend
npm install
npm run dev
```
- The frontend runs on `http://localhost:3000` by default.

### 4. Environment Variables
- Copy `.env.example` to `.env` in the backend folder and fill in your database and JWT secrets.

### 5. Email Verification (Optional)
- Configure SMTP settings in backend `.env` for email verification features.

## Usage
- Register and verify your email (if enabled).
- Create a new project from the dashboard.
- Add files using the sidebar. Choose language/extension for syntax highlighting.
- Click a file to open and edit it in the Monaco editor.
- For JavaScript files, use the built-in code runner.
- Invite team members to collaborate (UI present; backend integration may be required).

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Docker**: To execute the JS file
- **Websocket**: Scoket.io
- **Authentication**: JWT, bcrypt
- **Other**: Email verification, REST API

