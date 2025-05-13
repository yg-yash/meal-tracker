import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Container
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  Dashboard,
  Search,
  ListAlt,
  BarChart,
  ExitToApp,
  Login,
  PersonAdd,
  RestaurantMenu
} from '@mui/icons-material';
import AuthContext from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    logout();
    handleClose();
    if (mobileOpen) setMobileOpen(false);
  };

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <Dashboard />, auth: true },
    { title: 'Search Foods', path: '/food-search', icon: <Search />, auth: true },
    { title: 'Meal Log', path: '/meal-log', icon: <ListAlt />, auth: true },
    { title: 'Summary', path: '/meal-summary', icon: <BarChart />, auth: true },
    { title: 'Login', path: '/login', icon: <Login />, auth: false },
    { title: 'Register', path: '/register', icon: <PersonAdd />, auth: false }
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: theme.palette.primary.main }}>
        Meal Calorie Tracker
      </Typography>
      <Divider />
      <List>
        {navItems
          .filter(item => item.auth === isAuthenticated)
          .map((item) => (
            <ListItem 
              button 
              key={item.title} 
              component={Link} 
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : 'none',
                backgroundColor: isActive(item.path) ? 'rgba(76, 175, 80, 0.08)' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        {isAuthenticated && (
          <ListItem button onClick={onLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  const desktopMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {navItems
        .filter(item => item.auth === isAuthenticated)
        .map((item) => (
          <Button
            key={item.title}
            component={Link}
            to={item.path}
            color="inherit"
            className="btn-hover-effect"
            sx={{
              mx: 0.5,
              px: 2,
              position: 'relative',
              '&::after': isActive(item.path) ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30%',
                height: '3px',
                backgroundColor: 'white',
                borderRadius: '3px 3px 0 0'
              } : {}
            }}
            startIcon={item.icon}
          >
            {item.title}
          </Button>
        ))}
      {isAuthenticated && (
        <>
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/profile" onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={onLogout}>Logout</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0}
        sx={{
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? theme.palette.primary.main : theme.palette.primary.main,
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <Container>
          <Toolbar sx={{ padding: isMobile ? '0.5rem 0' : '0.5rem 0' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              <RestaurantMenu sx={{ mr: 1 }} />
              Meal Calorie Tracker
            </Typography>
            {!isMobile && desktopMenu}
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Toolbar spacer to prevent content from hiding under the AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
