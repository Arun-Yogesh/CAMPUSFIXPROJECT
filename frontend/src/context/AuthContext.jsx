import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campusfix_token');
      if (storedToken) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('campusfix_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const quickDemoLogin = async (role) => {
    let creds = { email: 'student@campusfix.edu', password: 'Student@123' };
    if (role === 'ADMIN') {
      creds = { email: 'admin@campusfix.edu', password: 'Admin@123' };
    } else if (role === 'STAFF') {
      creds = { email: 'staff@campusfix.edu', password: 'Staff@123' };
    }
    return login(creds.email, creds.password);
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('campusfix_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('campusfix_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickDemoLogin,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        isStaff: user?.role === 'STAFF',
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
