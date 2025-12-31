import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Load token from storage on mount

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      setToken(data.token);
    } catch (e) {
      console.log('Login error', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const switchIdentity = async (targetIdentity) => {
      setIsLoading(true);
      try {
          const data = await api('/identities/switch', {
              method: 'POST',
              body: JSON.stringify({ targetMetadata: targetIdentity }),
              token // Use current token to authorize switch
          });
          setToken(data.token); // Update to new identity token
          setUser({ ...data.identity, is_switched: true }); // Update user object context
      } catch (e) {
          throw e;
      } finally {
          setIsLoading(false);
      }
  };

  const register = async (name, email, password, type) => {
      setIsLoading(true);
      try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, type }),
        });
        setUser(data.user);
        setToken(data.token);
      } catch (e) {
          throw e;
      } finally {
          setIsLoading(false);
      }
  }

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      register, 
      logout, 
      switchIdentity,
      isAuthenticated: !!token, 
      setUser,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
