import React from 'react';
import { Box, TextField, Button } from '@mui/material';

function NoteForm({ value, onChange, onSubmit, isEditing, onCancel }) {
  return (
    <Box display="flex" gap={2} mb={3}>
      <TextField
        label={isEditing ? 'Edit note...' : 'Write a note...'}
        variant="outlined"
        fullWidth
        value={value}
        onChange={onChange}
      />
      <Button variant="contained" color="primary" onClick={onSubmit}>
        {isEditing ? 'Update' : 'Add'}
      </Button>
      {isEditing && (
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </Box>
  );
}

export default NoteForm;
