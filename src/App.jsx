import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, IconButton } from '@mui/material';
import { getTheme } from './theme';
import PasswordGenerator from './components/PasswordGenerator';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function App() {
  // Initialize mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });
  
  const theme = getTheme(mode);

  // Persist theme mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <IconButton onClick={toggleMode} color="inherit">
          {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
        <PasswordGenerator />
      </Container>
    </ThemeProvider>
  );
}