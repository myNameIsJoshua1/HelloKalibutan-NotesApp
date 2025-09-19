# BlockNotes - HelloKalibutan NotesApp

**BlockNotes** (HelloKalibutan NotesApp) is a full-stack note-taking application where users can register, log in, and manage their personal notes. It features a modern, responsive interface and secure backend services. Built with **React** for the frontend and **Spring Boot** for the backend.

---

## Features

* **User Management**

  * Register a new account with a username and password
  * Login and session persistence (stays logged in until logout)
* **Notes**

  * Create, edit, and delete personal notes
  * Each note has a **title** and **content**
  * Notes are private to each user
  * Search and sort functionality for easy note management
* **UI & UX**

  * Responsive and modern design
  * Logout button to end the session

---

## Tech Stack

* **Frontend:** React, Material-UI (MUI)
* **Backend:** Spring Boot, Java, JPA/Hibernate
* **Database:** H2, MySQL, or any configured JPA-compatible database
* **Build Tools:** Maven, npm

---

## Folder Structure

```
HelloKalibutan-NotesApp/
├── backend/
│   └── src/main/java/com/example/BlockNotes/
│       ├── controller/
│       ├── entity/
│       ├── repository/
│       └── service/
├── frontend/
│   └── blocknotes-frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── App.js
│       │   └── ...
│       └── public/
└── README.md
```

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/myNameIsJoshua1/HelloKalibutan-NotesApp.git
cd HelloKalibutan-NotesApp
```

---

### Backend (Spring Boot)

1. Navigate to the backend directory:

```bash
cd backend
```

2. Build and run the Spring Boot app using Maven:

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080` by default.
You can change database settings in `src/main/resources/application.properties`.

---

### Frontend (React)

1. Navigate to the frontend directory:

```bash
cd frontend/blocknotes-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the React app:

```bash
npm start
```

The frontend will run on `http://localhost:3000` by default.

---

## Usage

1. **Register**

   * Go to the Register page and create a new account with a username and password.
   * After registration, you will be redirected to the login page.

2. **Login**

   * Enter your credentials to log in.
   * The session persists even after refreshing the page, until you click Logout.

3. **Manage Notes**

   * Add, edit, or delete notes (title and content required).
   * Search and sort notes using the provided tools.
   * Only your notes are visible to you.

4. **Logout**

   * Click the Logout button to end your session.

---

## API Endpoints (Backend)

* `POST /api/users` — Register a new user
* `POST /api/users/login` — Login with username and password
* `GET /api/notes/user/{userId}` — Get all notes for a user
* `POST /api/notes/user/{userId}` — Add a new note for a user
* `PUT /api/notes/{noteId}` — Update a note
* `DELETE /api/notes/{noteId}` — Delete a note

---

## Git Commands for Collaboration

### Pull Latest Changes from Main

```bash
git pull origin main
```

### Update Your Branch from Main

```bash
# Switch to your feature branch
git checkout your-branch-name

# Fetch latest changes
git fetch origin

# Merge latest main into your branch
git merge origin/main
```

> ⚠️ If there are conflicts, resolve them manually, then commit the changes:

```bash
git add .
git commit -m "Resolved merge conflicts"
```

### Stage, Commit, and Push Changes

```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "Your commit message here"

# Push to your branch
git push origin your-branch-name
```

> ⚠️ **Tip:** Always create a new branch for your feature before pushing:

```bash
git checkout -b feature/your-feature-name
```

---

## Customization

* Database can be configured to H2, MySQL, or any other JPA-supported database.
* Frontend styling uses Material-UI and can be customized via `src/theme/theme.js`.

---

## License

This project is for **educational purposes**. You are free to use, modify, and learn from it.
