// components/profile/DeleteAccountModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import styles from "./styles.module.css";

const DeleteAccountModal = ({ open, onClose, onConfirm, username }) => {
  const [confirmText, setConfirmText] = useState("");
  const isMatch = confirmText.trim() === username;

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberIcon color="error" />
          <Typography variant="h6" color="error">
            Delete Account
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          This action is <strong>irreversible</strong>. Your account and all related data will be
          permanently deleted.
        </Typography>

        <Typography sx={{ mb: 1 }}>
          To confirm, please type <strong>{username}</strong> below:
        </Typography>

        <TextField
          autoFocus
          fullWidth
          placeholder={`Type "${username}"`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          error={confirmText && !isMatch}
          helperText={!isMatch && confirmText ? "Username does not match" : ""}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!isMatch}
        >
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountModal;
