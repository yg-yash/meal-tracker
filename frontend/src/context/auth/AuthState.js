import React, { useReducer } from 'react';
import axios from 'axios';
import API from '../../config/api';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  SET_LOADING
} from '../types';

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    // Set loading to true at the start
    dispatch({ type: SET_LOADING, payload: true });
    
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    } else {
      // If no token, immediately set as not authenticated and not loading
      dispatch({ type: AUTH_ERROR });
      return;
    }

    try {
      const res = await axios.get(API.auth.profile);

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Register User
  const register = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(API.auth.register, formData, config);

      // Set the token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set the token in axios headers for subsequent requests
      setAuthToken(res.data.token);
      
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });

      // Load user data immediately after registration
      await loadUser();
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response.data.message || 'Registration failed'
      });
    }
  };

  // Login User
  const login = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post(API.auth.login, formData, config);

      // Set the token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set the token in axios headers for subsequent requests
      setAuthToken(res.data.token);
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      // Load user data immediately after login
      await loadUser();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.message || 'Invalid credentials'
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: LOGOUT });

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
