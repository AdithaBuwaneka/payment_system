// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on page load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, []);

  // Regular user login
  const login = async (credentials, isAdmin = false) => {
    try {
      const url = isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(url, credentials);
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Authentication failed',
        status: error.response?.status
      };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...newUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Registration failed',
        status: error.response?.status
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to update profile',
        status: error.response?.status
      };
    }
  };

  // Change user password
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData);
      return true;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Failed to change password',
        status: error.response?.status
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        initialized,
        login, 
        register, 
        logout,
        updateProfile,
        changePassword
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};