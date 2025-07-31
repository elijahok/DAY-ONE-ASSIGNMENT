import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import Comparison from './pages/Comparison';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DA1F2', // Twitter blue
    },
    secondary: {
      main: '#14171A', // Twitter dark
    },
    background: {
      default: '#000000',
      paper: '#192734',
    },
    text: {
      primary: '#ffffff',
      secondary: '#8899A6',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #38444d',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '20px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/comparison" element={<Comparison />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;