import React from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import NoteList from '../components/NoteList';
import NoteForm from '../components/NoteForm';

function NotesPage({ notes, onAdd, onDelete, onEdit, onLogout, editingNote, newNote, setNewNote, newTitle, setNewTitle, isEditing, setIsEditing, setEditingNote }) {
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h3" align="center" gutterBottom>BlockNotes</Typography>
        <Button variant="outlined" color="secondary" onClick={onLogout}>Logout</Button>
      </Box>
      <NoteForm
        title={newTitle}
        onTitleChange={(e) => setNewTitle(e.target.value)}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onSubmit={onAdd}
        isEditing={isEditing}
        onCancel={() => {
          setIsEditing(false);
          setEditingNote(null);
          setNewNote('');
          setNewTitle('');
        }}
      />
      <Paper elevation={3}>
        <NoteList notes={notes} onDelete={onDelete} onEdit={onEdit} />
      </Paper>
    </Container>
  );
}

export default NotesPage;
