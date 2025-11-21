import { Paper, Typography, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function NoteList({ notes, onDelete, onEdit }) {
  return (
    <Box
      sx={{
        columnCount: { xs: 1, sm: 2, md: 3 },
        columnGap: "16px",
        width: "100%",
        mt: 2,
      }}
    >
      {notes
        .slice()
        .reverse()
        .map((note) => (
          <Paper
            key={note.id}
            elevation={6}
            sx={{
              breakInside: "avoid",
              mb: 2,
              p: 2,
            }}
          >
            <Typography variant="h6">{note.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {note.content}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
              <IconButton color="primary" onClick={() => onEdit(note)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton color="error" onClick={() => onDelete(note.id)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
    </Box>
  );
}

export default NoteList;
