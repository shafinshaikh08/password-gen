import { useState, useEffect } from 'react';
import StrengthMeter from './StrengthMeter';
import {
  Box, Typography, Slider, Checkbox, FormControlLabel,
  Button, TextField, Stack, Snackbar, InputAdornment, IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PasswordGenerator() {
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // === LOAD HISTORY + PASSWORD FROM localStorage ONCE ===
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("passwordHistory");
      const savedPassword = localStorage.getItem("lastPassword");

      console.log("Loading from localStorage:");
      console.log("savedHistory:", savedHistory);
      console.log("savedPassword:", savedPassword);

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        console.log("Parsed history:", parsedHistory);
        setHistory(parsedHistory);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      // Reset localStorage if corrupted
      localStorage.removeItem("passwordHistory");
      localStorage.removeItem("lastPassword");
    }
  }, []);

  // === SAVE PASSWORD ON CHANGE ===
  useEffect(() => {
    if (password) {
      console.log("Saving password to localStorage:", password);
      localStorage.setItem("lastPassword", password);
    }
  }, [password]);

  // === SAVE HISTORY ON CHANGE ===
  useEffect(() => {
    if (history.length > 0) { // Only save if history has items
      console.log("Saving history to localStorage:", history);
      localStorage.setItem("passwordHistory", JSON.stringify(history));
    }
  }, [history]);

  const handleOptionChange = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePassword = () => {
    let chars = '';
    if (options.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?/~';

    if (chars.length === 0) {
      showSnackbar("Select at least one option.");
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(result);

    // Update history - ensure we don't add duplicates
    setHistory(prev => {
      // Remove the new password if it already exists in history
      const filteredHistory = prev.filter(pw => pw !== result);
      // Add new password at the beginning and keep only 5
      const updated = [result, ...filteredHistory].slice(0, 5);
      console.log("New history:", updated);
      return updated;
    });

    showSnackbar("Password generated!");
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showSnackbar("Password copied!");
    }).catch(err => {
      console.error("Copy failed:", err);
      showSnackbar("Failed to copy password");
    });
  };

  const handleDelete = (index) => {
    setHistory(prev => {
      const updated = prev.filter((_, i) => i !== index);
      console.log("History after delete:", updated);
      // Update localStorage immediately after deletion
      if (updated.length === 0) {
        localStorage.removeItem("passwordHistory");
      } else {
        localStorage.setItem("passwordHistory", JSON.stringify(updated));
      }
      return updated;
    });
    showSnackbar("Password deleted.");
  };

  const downloadHistory = () => {
    if (history.length === 0) return;

    const content = ["Generated Passwords:"]
      .concat(history.map((pw, i) => `${i + 1}. ${pw}`))
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'passwords_history.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSnackbar("History downloaded!");
  };

  const showSnackbar = (msg) => {
    setSnackbarMessage(msg);
    setSnackbarOpen(true);
  };



  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Password Generator</Typography>

      {/* Slider */}
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Password Length: {length}</Typography>
        <Slider
          value={length}
          min={6}
          max={50}
          onChange={(e, val) => setLength(val)}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Options */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {[
          { key: 'upper', label: 'Uppercase (A-Z)' },
          { key: 'lower', label: 'Lowercase (a-z)' },
          { key: 'numbers', label: 'Numbers (0-9)' },
          { key: 'symbols', label: 'Symbols (!@#$)' }
        ].map(opt => (
          <FormControlLabel
            key={opt.key}
            control={
              <Checkbox
                checked={options[opt.key]}
                onChange={() => handleOptionChange(opt.key)}
              />
            }
            label={opt.label}
          />
        ))}
      </Stack>

      {/* Generate Button */}
      <Button variant="contained" sx={{ mt: 2 }} onClick={generatePassword}>
        Generate Password
      </Button>

      {/* Password Field with Copy Icon */}
      <TextField
        label="Generated Password"
        value={password}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
          style: { fontFamily: 'monospace' },
          endAdornment: password && (
            <InputAdornment position="end">
              <IconButton onClick={() => handleCopy(password)} edge="end">
                <ContentCopyIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Strength Meter - Only if password exists */}
      {password && (
        <StrengthMeter password={password} />
      )}

      {/* Password History */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Password History ({history.length}/5)</Typography>
        {history.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No history yet. Generate some passwords to see them here!
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {history.map((pw, idx) => (
              <Box key={`${pw}-${idx}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField 
                  value={pw} 
                  size="small" 
                  fullWidth 
                  InputProps={{ 
                    readOnly: true,
                    style: { fontFamily: 'monospace' }
                  }} 
                />
                <IconButton sx={{ ml: 1 }} onClick={() => handleCopy(pw)}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton sx={{ ml: 1 }} onClick={() => handleDelete(idx)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Download Button */}
      {history.length > 0 && (
        <Button variant="outlined" sx={{ mt: 2 }} onClick={downloadHistory}>
          Download History (.txt)
        </Button>
      )}

      {/* Snackbar for all actions */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
    </Box>
  );
}