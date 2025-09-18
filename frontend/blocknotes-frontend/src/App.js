import React, { useState, useEffect } from "react";
import axios from "axios";
import NotesPage from "./pages/NotesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import ParticleBackground from "./components/NoteCard";
import "./App.css";


function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [page, setPage] = useState("login"); // 'login' | 'register' | 'notes'

  useEffect(() => {
    if (user) {
      fetchNotes();
      setPage("notes");
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/notes/user/${user.id}`);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const addNote = async (e) => {
    if (e) e.preventDefault();
    if (!newNote.trim() || !newTitle.trim()) return;
    try {
      if (isEditing && editingNote) {
        // Update note
        const res = await axios.put(`http://localhost:8080/api/notes/${editingNote.id}`, {
          ...editingNote,
          title: newTitle,
          content: newNote,
        });
        setNotes(notes.map((n) => (n.id === editingNote.id ? res.data : n)));
        setIsEditing(false);
        setEditingNote(null);
        setNewNote("");
        setNewTitle("");
      } else {
        // Add note
        const res = await axios.post(`http://localhost:8080/api/notes/user/${user.id}`, {
          title: newTitle,
          content: newNote,
        });
        setNotes([...notes, res.data]);
        setNewNote("");
        setNewTitle("");
      }
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/notes/${id}`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const editNote = (note) => {
    setIsEditing(true);
    setEditingNote(note);
    setNewNote(note.content);
    setNewTitle(note.title);
  };

  const handleLogin = async ({ username, password }) => {
    try {
      const res = await axios.post("http://localhost:8080/api/users/login", { username, password });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setPage("notes");
    } catch (err) {
      alert("Invalid username or password");
    }
  };

  const handleRegister = async ({ username, password }) => {
    try {
      const res = await axios.post("http://localhost:8080/api/users", { username, password });
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setPage("notes");
    } catch (err) {
      alert("Registration failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setNotes([]);
    setPage("login");
  };

  if (!user) {
    if (page === "register") {
      return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage("login")} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ParticleBackground />
      <div className="app-root">
        <NotesPage
          notes={notes}
          onAdd={addNote}
          onDelete={deleteNote}
          onEdit={editNote}
          onLogout={handleLogout}
          editingNote={editingNote}
          newNote={newNote}
          setNewNote={setNewNote}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setEditingNote={setEditingNote}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;