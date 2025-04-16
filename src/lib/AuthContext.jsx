import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (!token || !userData) {
        setUser(null);
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(userData);
      const tokenExpiry = new Date(parsedData.tokenExpiry);
      const now = new Date();

      // Check if token is expired
      if (now >= tokenExpiry) {
        // Token is expired, clear storage
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      // Set the user from localStorage first
      setUser(parsedData);

      // Then try to validate with server in the background
      try {
        const response = await userApi.getProfile(); // Use updated route
        setUser(response.data);
      } catch (error) {
        console.error('Server validation failed:', error);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await userApi.login(email, password);
      const { token, user } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Calculate token expiration (24 hours from now)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Store user data with token expiration
      const userData = {
        ...user,
        token,
        tokenExpiry: tokenExpiry.toISOString(),
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(user);

      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await userApi.register(userData);
      const { token, user } = response.data;

      // Calculate token expiration (24 hours from now)
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      // Store user data with token expiration
      const userDataWithExpiry = {
        ...user,
        token,
        tokenExpiry: tokenExpiry.toISOString(),
      };

      localStorage.setItem('userData', JSON.stringify(userDataWithExpiry));
      localStorage.setItem('token', token);
      setUser(user);

      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};