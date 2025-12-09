import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        if (response.data.success) {
          setUser(response.data.data);
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.data);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.data);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

