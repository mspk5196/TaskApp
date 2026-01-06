import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdentity, setCurrentIdentity] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await ApiService.isAuthenticated();
      if (isAuth) {
        const response = await ApiService.getProfile();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          await ApiService.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        await AsyncStorage.setItem('userName', response.data.user.name || '');
        await AsyncStorage.setItem('userPhone', response.data.user.phone || '');
        await AsyncStorage.setItem('userEmail', response.data.user.email || '');
        const rawRoles = response.data.user.role || '';
        const rolesArray = rawRoles
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
        await AsyncStorage.setItem('userRoles', JSON.stringify(rolesArray));
        await AsyncStorage.setItem('userLoginMethod', 'jwt');

        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (email) => {
    try {
      const response = await ApiService.g_login(email);
      if (response.success) {
        setUser(response.data.user);

        await AsyncStorage.setItem('userName', response.data.user.name || '');
        await AsyncStorage.setItem('userPhone', response.data.user.phone || '');
        await AsyncStorage.setItem('userEmail', response.data.user.email || '');
        const rawRoles = response.data.user.role || '';
        const rolesArray = rawRoles
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
        await AsyncStorage.setItem('userRoles', JSON.stringify(rolesArray));
        await AsyncStorage.setItem('userLoginMethod', 'google');

        return response;
      }
      throw new Error(response.message);
    } catch (error) {
      throw error;
    }
  };

  const selectIdentity = async (identity) => {
    try {
      setCurrentIdentity(identity);
      await AsyncStorage.setItem('currentIdentity', identity || '');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error selecting identity:', error);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      await AsyncStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    currentIdentity,
    login,
    loginWithGoogle,
    logout,
    selectIdentity,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
