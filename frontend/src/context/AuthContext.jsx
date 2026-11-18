import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          applyTheme(res.user.theme || 'light');
        }
      } catch (err) {
        setUser(null);
        applyTheme('light');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.user) {
      setUser(res.user);
      applyTheme(res.user.theme || 'light');
    }
    return res;
  };

  const register = async (name, email, password, currency) => {
    const res = await api.register({ name, email, password, currency });
    if (res.success && res.user) {
      setUser(res.user);
      applyTheme(res.user.theme || 'light');
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      applyTheme('light');
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      if (updatedFields.theme) {
        applyTheme(updatedFields.theme);
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
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
