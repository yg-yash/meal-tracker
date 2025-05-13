import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const PrivateRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, loadUser } = authContext;
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.token) {
        try {
          await loadUser();
        } catch (err) {
          console.error('Error loading user:', err);
          // Clear token if it's invalid
          localStorage.removeItem('token');
        }
      }
      // Set loading to false regardless of authentication result
      setLocalLoading(false);
    };
    
    checkAuth();
    
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading && localLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
