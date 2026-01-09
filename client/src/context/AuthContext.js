import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

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

  const checkAuth = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      throw error; // Re-throw so callers can handle it
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - function is stable

  // Check if user is logged in on mount
  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth().catch(() => {
      // Failed to extract user, assumes not logged in.
      // Error is already handled in checkAuth (setting user to null)
    });
  }, [checkAuth]);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const setUserDirectly = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    checkAuth,
    setUserDirectly,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

