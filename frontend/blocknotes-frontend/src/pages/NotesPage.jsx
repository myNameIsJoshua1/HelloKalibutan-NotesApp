import { Blockfrost, WebWallet, Blaze, Core} from "@blaze-cardano/sdk";
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function NotesPage({
  notes,
  onAdd,
  onDelete,
  onEdit,
  onLogout,
  newNote,
  setNewNote,
  newTitle,
  setNewTitle,
  isEditing,
  setIsEditing,
  setEditingNote,
  search,
  setSearch,
  sort,
  setSort,
}) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [walletApi, setWalletApi] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletAddress, setWalletAddress] = useState(''); 
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(0n);

  const [provider] = useState(() => new Blockfrost({
    network: 'cardano-preview',
    projectId: 'preview2YCkQ5oHRIwnyfVyzx29YBBsmMEb33B6',
  }))

  useEffect(() => {
    if (window.cardano) {
      setWallets(Object.keys(window.cardano));
    }
  }, []);

  const handleWalletChange = (e) => {
    const walletName = e.target.value;
    setSelectedWallet(walletName);
  };

  const handleConnectWallet = async () => {
    console.log("Connecting to wallet:", selectedWallet);
    if (selectedWallet && window.cardano[selectedWallet]) {
      try {
        const api = await window.cardano[selectedWallet].enable();
        setWalletApi(api);
        console.log("Connected to wallet API:", api);

        const address = await api.getChangeAddress();
        console.log("Wallet address (hex):", address);
        setWalletAddress(address);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(BigInt(e.target.value));
  };

  const handleSubmitTransaction = async () => {
    if (walletApi) {
      try {
        const wallet = new WebWallet(walletApi);
        const blaze = await Blaze.from(provider, wallet);
        console.log("Blaze instance created:", blaze);

        const bech32Address = Core.Address.fromBytes(Buffer.from(walletAddress, 'hex')).toBech32()
        console.log("Recipient Bech32 address:", bech32Address);

        const tx = await blaze
          .newTransaction()
          .payLovelace(
            Core.Address.fromBech32(recipient),
            amount
          )
          .complete();
        
        console.log("Transaction built:", tx.toCbor());

        const signedTx = await blaze.signTransaction(tx);
        console.log("Transaction signed:", signedTx.toCbor());

        const txHash = await blaze.provider.postTransactionToChain(signedTx);
        console.log("Transaction submitted. Hash:", txHash);
      } catch (error) {
        console.error("Error submitting transaction:", error);
      }
    }
  };

  // --- Dialog Handlers ---
  const openAdd = () => {
    setIsEditing(false);
    setEditingNote(null);
    setNewTitle("");
    setNewNote("");
    setOpenEditDialog(true);
  };

  const openEdit = (note, e) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setEditingNote(note);
    setNewTitle(note.title);
    setNewNote(note.content);
    setOpenEditDialog(true);
  };

  const closeEdit = () => {
    setOpenEditDialog(false);
    setIsEditing(false);
    setEditingNote(null);
  };

  const saveNote = async () => {
    await onAdd();
    closeEdit();
  };

  // --- Read-only Overview ---
  const openView = (note) => setViewNote(note);
  const closeView = () => setViewNote(null);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 4,
        px: { xs: 2, sm: 4, md: 8, lg: 12 },
      }}
    >
      {/* Wallet Connection Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <select value={selectedWallet} onChange={handleWalletChange}>
          <option value="">Select Wallet</option>
          {wallets.length > 0 && wallets.map((wallet) => (
            <option key={wallet} value={wallet}>
              {wallet}
            </option>
          ))}
        </select>
        {walletApi ? 
          (<div>Wallet Connected</div>) :
        (<button onClick={handleConnectWallet}>Connect Wallet</button>)}
        
        <div>
          <p>Connected Address: {walletAddress || "Not connected"}</p>
          <label>Recipient Address:</label>
          <input type="text" placeholder="Enter Recipient Address" value={recipient} onChange={handleRecipientChange}/>
          <label>Amount:</label>
          <input type="number" placeholder="Enter Amount" value={amount} onChange={handleAmountChange}/>
          <button onClick={handleSubmitTransaction}>Send ADA</button>
        </div>
      </Box>

      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Notes
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            size="small"
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>

          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            placeholder="Search"
            sx={{ minWidth: 180 }}
          />

          <IconButton
            onClick={openAdd}
            color="primary"
            sx={{ width: 48, height: 48 }}
          >
            <AddIcon fontSize="large" />
          </IconButton>

          <Button
            variant="outlined"
            color="secondary"
            onClick={onLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Notes Grid */}
      <Grid container spacing={4} justifyContent="flex-start">
        {notes.map((note) => (
          <Grid key={note.id} item>
            <Paper
              elevation={3}
              onClick={() => openView(note)}
              sx={{
                width: 260,
                height: 220,
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                overflow: "hidden",
                userSelect: "none",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                noWrap
                title={note.title}
                sx={{ fontWeight: 600 }}
              >
                {note.title || "Untitled"}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  flexGrow: 1,
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                }}
              >
                {note.content}
              </Typography>

              <Box
                sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(note, e);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Read-only Overview Dialog */}
      <Dialog open={!!viewNote} onClose={closeView} fullWidth maxWidth="md">
        <DialogTitle>{viewNote?.title || "Untitled"}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {viewNote?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={openEditDialog} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? "Edit Note" : "New Note"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            minRows={4}
            margin="dense"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              closeEdit();
              if (!isEditing) {
                setNewTitle("");
                setNewNote("");
              }
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={saveNote}>
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default NotesPage;
