import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CompareIcon from '@mui/icons-material/Compare';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { path: '/comparison', label: 'Compare', icon: <CompareIcon /> },
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <TwitterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            X Content Analyzer
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                bgcolor: location.pathname === item.path ? 'primary.main' + '20' : 'transparent',
                '&:hover': {
                  bgcolor: 'primary.main' + '10',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
            AI-Powered Social Media Analytics
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;