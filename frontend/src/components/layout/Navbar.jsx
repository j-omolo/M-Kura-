import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  HowToVote,
  Dashboard,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <HowToVote />
        </IconButton>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Mkura Voting System
        </Typography>
        <Box>
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/create-poll"
                    startIcon={<HowToVote />}
                    sx={{ mr: 1 }}
                  >
                    Create Poll
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/dashboard"
                    startIcon={<AdminPanelSettings />}
                    sx={{ mr: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                </>
              )}
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<Dashboard />}
                sx={{ mr: 1 }}
              >
                Dashboard
              </Button>
              <IconButton
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              <Button color="inherit" component={Link} to="/admin/login">
                Admin Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 