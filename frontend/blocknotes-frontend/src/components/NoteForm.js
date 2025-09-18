import React from 'react';
import { Box, TextField, Button } from '@mui/material';

function NoteForm({ title, onTitleChange, value, onChange, onSubmit, isEditing, onCancel }) {
  return (
    <Box display="flex" flexDirection="column" gap={2} mb={3}>
      <TextField
        label={isEditing ? 'Edit title...' : 'Note title...'}
        variant="outlined"
        fullWidth
        value={title}
        onChange={onTitleChange}
        sx={{ mb: 1 }}
      />
      <TextField
        label={isEditing ? 'Edit note...' : 'Write a note...'}
        variant="outlined"
        fullWidth
        value={value}
        onChange={onChange}
        sx={{ mb: 1 }}
      />
      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          {isEditing ? 'Update' : 'Add'}
        </Button>
        {isEditing && (
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default NoteForm;
