import { Lucid, Blockfrost } from "lucid-cardano";
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
  FormControl,
  InputLabel,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SendIcon from "@mui/icons-material/Send"; // Kept import if needed
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// Removed unused imports to clean up
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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
  user = { username: "User" }, // Default user object
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
    projectId: 'previewQMLEHlZRadshjVzchb7tPWWRZpvYpIyz',
  }))
  const [lucid, setLucid] = useState(null);

  useEffect(() => {
    const initLucid = async () => {
      const lucidInstance = await Lucid.new(
        new Blockfrost(
          'https://cardano-preview.blockfrost.io/api/v0',
          import.meta.env.VITE_BLACKFROST_PROJECT_ID
        ),
        'Preview'
      );
      setLucid(lucidInstance);
    };
    initLucid();
  }, []);

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
    if (selectedWallet && window.cardano[selectedWallet] && lucid) {
      try {
        const api = await window.cardano[selectedWallet].enable();
        setWalletApi(api);
        console.log("Connected to wallet API:", api);

        lucid.selectWallet(api);
        const address = await lucid.wallet.address();
        console.log("Wallet address (bech32):", address);
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

  
  const createTxNote = async ({ status, txHash, from, to, lovelaceAmount, adaAmount, timestamp, extra }) => {
    const title = status || (txHash ? "Success" : "Failed");

    const lines = [];
    lines.push(`Status: ${title}`);
    if (txHash) lines.push(`TxHash: ${txHash}`);
    if (from) lines.push(`From: ${from}`);
    if (to) lines.push(`To: ${to}`);
    if (lovelaceAmount !== undefined) lines.push(`Amount (lovelace): ${lovelaceAmount}`);
    if (adaAmount !== undefined) lines.push(`Amount (ADA): ${adaAmount}`);
    if (timestamp) lines.push(`Timestamp: ${timestamp}`);
    if (extra) lines.push(`Extra: ${extra}`);

    const content = lines.join("\n");

    try {
      await onAdd({ title, content });
    } catch (err) {
      console.error("Error creating transaction note:", err);
    }
  };


  const handleSubmitTransaction = async () => {
    if (walletApi && lucid) {
      try {
        const tx = await lucid
          .newTx()
          .payToAddress(recipient, { lovelace: amount })
          .complete();
        
        console.log("Transaction built:", tx.toString());

        const signedTx = await tx.sign().complete();
        console.log("Transaction signed:", signedTx.toString());

        const txHash = await signedTx.submit();
        console.log("Transaction submitted. Hash:", txHash);

        const iso = new Date().toISOString();
        const ada = Number(amount) / 1000000;

        await createTxNote({
          status: "Success",
          txHash,
          from: walletAddress,
          to: recipient,
          lovelaceAmount: amount.toString(),
          adaAmount: ada,
          timestamp: iso,
        });
      } catch (error) {
        console.error("Error submitting transaction:", error);
        const iso = new Date().toISOString();

        await createTxNote({
          status: "Failed",
          txHash: null,
          from: walletAddress || null,
          to: recipient || null,
          lovelaceAmount: amount ? amount.toString() : undefined,
          adaAmount: amount ? Number(amount) / 1000000 : undefined,
          timestamp: iso,
          extra: (error && error.message) ? error.message : String(error),
        });
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

  // Random nebula colors matching the particle background
  const nebulaColors = [
    "rgba(142,45,226,0.25)",
    "rgba(255,0,150,0.2)",
    "rgba(0,200,255,0.15)",
    "rgba(255,150,50,0.1)",
  ];

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 4,
        px: { xs: 2, sm: 4, md: 8, lg: 12 },
      }}
    >
      {/* 🌌 COMPACT COSMIC WALLET CARD 🌌 */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 0,
          background: "transparent",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Outer Glow Container - MARGINS UNCHANGED */}
        <Box
          sx={{
            position: "relative",
            background: `
              radial-gradient(circle at 20% 50%, ${nebulaColors[0]}, transparent 70%),
              radial-gradient(circle at 80% 50%, ${nebulaColors[1]}, transparent 70%),
              radial-gradient(circle at 50% 100%, ${nebulaColors[2]}, transparent 60%)
            `,
            borderRadius: "10px",
            padding: "1px", // Minimal border size maintained
            animation: "pulse 3s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { boxShadow: "0 0 20px rgba(142,45,226,0.2)" },
              "50%": { boxShadow: "0 0 28px rgba(142,45,226,0.3)" },
            },
          }}
        >
          {/* Inner Card Background */}
          <Box
            sx={{
              background: "linear-gradient(135deg, rgba(20,20,40,0.98) 0%, rgba(30,15,50,0.98) 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: "9px",
              p: 1.5, // Reduced padding for compactness
              border: "1px solid rgba(142,45,226,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
             {/* Header Title - Made Smaller & Integrated */}

            {/* Welcome Message */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1, ml: 0.5, justifyContent: "flex-start" }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 800,
                        background: "linear-gradient(90deg, #8e2de2, #ff9800, #00d4ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        fontSize: "0.9rem",
                        fontFamily: "'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                        textShadow: "0 0 10px rgba(142,45,226,0.5)",
                    }}
                >
                    Welcome, {user.username}
                </Typography>
            </Box>

            {/* Unified Layout: Wallet | Transaction | Notes Controls */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
            }}>

                {/* === LEFT: Wallet Side === */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    minWidth: "200px",
                    background: "rgba(142,45,226,0.08)",
                    border: "1px solid rgba(142,45,226,0.3)",
                    borderRadius: "6px",
                    p: 1,
                }}>
                    <FormControl size="small" variant="standard" sx={{ minWidth: "160px" }}>
                        <InputLabel sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
                            Select Wallet
                        </InputLabel>
                        <Select
                        value={selectedWallet}
                        onChange={handleWalletChange}
                        sx={{
                            color: "#fff",
                            fontSize: "0.8rem",
                            "&:before": { borderColor: "rgba(142,45,226,0.3)" },
                            "&:after": { borderColor: "#8e2de2" },
                        }}
                        >
                        {wallets.map((wallet) => (
                            <MenuItem key={wallet} value={wallet} dense>
                            {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: "28px" }}>
                        {!walletApi ? (
                            <Button
                            variant="contained"
                            onClick={handleConnectWallet}
                            disabled={!selectedWallet}
                            sx={{
                                height: "26px",
                                minWidth: "38px",
                                background: "linear-gradient(90deg, #8e2de2, #4a00e0)",
                                "&:hover": { background: "linear-gradient(90deg, #4a00e0, #8e2de2)" },
                            }}
                            >
                            <AccountBalanceWalletIcon fontSize="small" />
                            </Button>
                        ) : (
                            <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 18 }} />
                        )}

                        {/* Inline Address Display */}
                        {walletAddress && (
                            <Typography sx={{
                                fontSize: "0.5rem",
                                fontFamily: "monospace",
                                color: "#00d4ff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "110px"
                            }}>
                                {walletAddress.slice(0, 6)}...
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* === CENTER: Transaction Controls === */}
                <Box sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    flex: 1,
                    maxWidth: "500px",
                }}>
                    <TextField
                        size="small"
                        label="Recipient Address"
                        placeholder="addr1..."
                        value={recipient}
                        onChange={handleRecipientChange}
                        disabled={!walletApi}
                        variant="outlined"
                        sx={{
                            minWidth: "200px",
                            "& .MuiOutlinedInput-root": {
                                height: "35px",
                                color: "white",
                                fontSize: "0.75rem",
                                "& fieldset": { borderColor: "transparent" },
                                "&:hover fieldset": { borderColor: "transparent" },
                                "&.Mui-focused fieldset": { borderColor: "transparent" },
                            },
                            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", top: "-4px" },
                            "& .MuiInputLabel-shrink": { top: "0px" },
                        }}
                    />

                    <TextField
                        size="small"
                        label="Lovelace"
                        placeholder="1000000"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={!walletApi}
                        variant="outlined"
                        sx={{
                            minWidth: "120px",
                            "& .MuiOutlinedInput-root": {
                                height: "35px",
                                color: "white",
                                fontSize: "0.75rem",
                                "& fieldset": { borderColor: "rgba(255,152,0,0.3)" },
                                "&:hover fieldset": { borderColor: "rgba(255,152,0,0.6)" },
                                "&.Mui-focused fieldset": { borderColor: "#ff9800" },
                            },
                            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", top: "-4px" },
                            "& .MuiInputLabel-shrink": { top: "0px" },
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleSubmitTransaction}
                        disabled={!walletApi || !recipient || !amount}
                        sx={{
                            height: "35px",
                            background: "linear-gradient(90deg, #ff9800, #ff5722)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: 1,
                            px: 2,
                            "&:hover": {
                                background: "linear-gradient(90deg, #ff5722, #ff9800)",
                                boxShadow: "0 0 15px rgba(255,152,0,0.5)",
                            },
                        }}
                    >
                        SEND
                    </Button>
                </Box>

                {/* === RIGHT: Notes Controls === */}
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap"
                }}>
                    <Select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 100,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(142,45,226,0.3)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#8e2de2',
                            },
                        }}
                    >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="title">Title</MenuItem>
                    </Select>

                    <TextField
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        placeholder="Search notes..."
                        sx={{
                            minWidth: 140,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'rgba(142,45,226,0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#8e2de2',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#8e2de2',
                                },
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(255,255,255,0.5)',
                            },
                        }}
                    />

                    <IconButton
                        onClick={openAdd}
                        sx={{
                            background: "linear-gradient(45deg, #8e2de2, #4a00e0)",
                            color: "#fff",
                            width: 36,
                            height: 36,
                            "&:hover": {
                                background: "linear-gradient(45deg, #4a00e0, #8e2de2)",
                                boxShadow: "0 0 12px rgba(142,45,226,0.6)",
                            },
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>

                    <Button
                        variant="outlined"
                        onClick={onLogout}
                        sx={{
                            borderColor: "#ff9800",
                            color: "#ff9800",
                            height: 36,
                            fontSize: "0.75rem",
                            "&:hover": {
                                borderColor: "#ff9800",
                                background: "rgba(255,152,0,0.1)",
                                boxShadow: "0 0 12px rgba(255,152,0,0.4)",
                            },
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* NOTES SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textShadow: "0 0 25px rgba(142,45,226,0.8)",
            mb: 3,
          }}
        >
          Notes
        </Typography>
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

      {/* Dialogs */}
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