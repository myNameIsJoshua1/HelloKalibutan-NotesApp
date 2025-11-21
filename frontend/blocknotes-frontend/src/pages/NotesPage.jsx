import { Blockfrost, WebWallet, Blaze, Core } from "@blaze-cardano/sdk";
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
  Chip,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SendIcon from "@mui/icons-material/Send";

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
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0n);

  const [provider] = useState(
    () =>
      new Blockfrost({
        network: "cardano-preview",
        projectId: "previewQMLEHlZRadshjVzchb7tPWWRZpvYpIyz",
      })
  );

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
    if (selectedWallet && window.cardano[selectedWallet]) {
      try {
        const api = await window.cardano[selectedWallet].enable();
        setWalletApi(api);

        const address = await api.getChangeAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    }
  };

  const saveNote = async () => {
    await onAdd();
    closeEdit();
  };

  const openAdd = () => {
    setIsEditing(false);
    setEditingNote(null);
    setNewTitle("");
    setNewNote("");
    setOpenEditDialog(true);
  };

  const openEdit = (note, e) => {
    e.stopPropagation();
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

  const openView = (note) => setViewNote(note);
  const closeView = () => setViewNote(null);

  const handleRecipientChange = (e) => setRecipient(e.target.value);
  const handleAmountChange = (e) => setAmount(BigInt(e.target.value));

  const handleSubmitTransaction = async () => {
    if (!walletApi) return;

    try {
      const wallet = new WebWallet(walletApi);
      const blaze = await Blaze.from(provider, wallet);

      const tx = await blaze
        .newTransaction()
        .payLovelace(Core.Address.fromBech32(recipient), amount)
        .complete();

      const signedTx = await blaze.signTransaction(tx);
      const txHash = await blaze.provider.postTransactionToChain(signedTx);

      console.log("Tx hash:", txHash);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, px: { xs: 2, sm: 4, md: 8, lg: 12 } }}>

      {/* ---------------------- TOP BAR (NOW OUTSIDE WALLET BOX) ---------------------- */}
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
          <Select value={sort} onChange={(e) => setSort(e.target.value)} size="small" sx={{ minWidth: 100 }}>
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

          <IconButton onClick={openAdd} color="primary" sx={{ width: 48, height: 48 }}>
            <AddIcon fontSize="large" />
          </IconButton>

          <Button variant="outlined" color="secondary" onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* ------------------------- WALLET BOX ------------------------- */}
      <Paper
        elevation={6}
        sx={{
          mb: 4,
          p: 3,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
          <AccountBalanceWalletIcon sx={{ color: "#a0c4ff" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
            Cardano Wallet
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column (Connect Wallet) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                Connect Your Wallet
              </Typography>

              <Select
                value={selectedWallet}
                onChange={handleWalletChange}
                fullWidth
                size="small"
                disabled={!!walletApi}
                displayEmpty
                sx={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
              >
                <MenuItem value="" disabled>
                  Select Wallet
                </MenuItem>

                {wallets.map((wallet) => (
                  <MenuItem key={wallet} value={wallet}>
                    {wallet}
                  </MenuItem>
                ))}
              </Select>

              {walletApi ? (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(142, 251, 142, 0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Chip
                    label="Connected"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(142,251,142,0.2)",
                      color: "#8efb8e",
                    }}
                  />

                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      display: "block",
                      mt: 1,
                    }}
                  >
                    {walletAddress}
                  </Typography>
                </Box>
              ) : (
                <Button variant="contained" fullWidth onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right Column (Send ADA) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                Send ADA
              </Typography>

              <TextField
                label="Recipient Address"
                disabled={!walletApi}
                value={recipient}
                onChange={handleRecipientChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Amount"
                type="number"
                disabled={!walletApi}
                value={amount.toString()}
                onChange={handleAmountChange}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Lovelace</InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                fullWidth
                startIcon={<SendIcon />}
                disabled={!walletApi || !recipient || amount <= 0n}
                onClick={handleSubmitTransaction}
              >
                Send Transaction
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ------------------------- NOTES GRID ------------------------- */}
      <Grid container spacing={4}>
        {notes.map((note) => (
          <Grid item key={note.id}>
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
              }}
            >
              <Typography variant="h6" noWrap>
                {note.title || "Untitled"}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  flexGrow: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {note.content}
              </Typography>

              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button size="small" onClick={(e) => openEdit(note, e)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* View Note Dialog */}
      <Dialog open={!!viewNote} onClose={closeView} fullWidth maxWidth="md">
        <DialogTitle>{viewNote?.title || "Untitled"}</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ whiteSpace: "pre-line" }}>{viewNote?.content}</Typography>
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
