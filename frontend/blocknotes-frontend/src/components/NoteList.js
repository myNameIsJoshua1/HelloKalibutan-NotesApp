import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function NoteList({ notes, onDelete, onEdit }) {
  return (
    <List>
      {notes.map((note) => (
        <ListItem key={note.id} secondaryAction={
          <>
            <IconButton edge="end" color="primary" onClick={() => onEdit(note)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" color="error" onClick={() => onDelete(note.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        }>
          <ListItemText primary={note.title} secondary={note.content} />
        </ListItem>
      ))}
    </List>
  );
}

export default NoteList;
