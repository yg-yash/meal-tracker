import React from 'react';
import { Box, Typography, Container, Grid, useTheme } from '@mui/material';
import {  FavoriteBorder } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.primary.dark,
        color: 'white',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }}
      className="fade-in"
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
              Meal Calorie Tracker
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Track your nutrition. Achieve your goals.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              &copy; {currentYear} Meal Calorie Tracker
            </Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' }, mt: 0.5 }}>
              Made with <FavoriteBorder sx={{ mx: 0.5, fontSize: '0.8rem', color: theme.palette.secondary.light }} /> for healthy living
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
