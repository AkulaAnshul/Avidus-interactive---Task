import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // Load user profile on startup or token refresh
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          // Token expired, corrupted, or user deactivated
          logout();
          setError(data.message || 'Session expired');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setError('Server is unreachable. Retrying...');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        setError(data.message || 'Invalid email or password');
        setLoading(false);
        return { success: false, message: data.message || 'Invalid login details' };
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.');
      setLoading(false);
      return { success: false, message: 'Server unreachable' };
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'User') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.');
      setLoading(false);
      return { success: false, message: 'Server unreachable' };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setError,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
