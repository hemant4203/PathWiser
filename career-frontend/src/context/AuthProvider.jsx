import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axiosClient from '../api/axiosClient';

export const AuthProvider = ({ children }) => {

  // 1. Strict Initialization
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    return {
      isAuthenticated: !!token,
      username: localStorage.getItem('username') || null,
      role: role || null
    };
  });

  // 3. Logout function
  const logout = () => {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setAuthState({
      isAuthenticated: false,
      username: null,
      role: null
    });

    window.location.href = '/login';
  };
  // 🔹 NEW: Restore session on app load using refresh token
  useEffect(() => {

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) return;

    axiosClient
      .post('/api/auth/refresh', { refreshToken })
      .then((res) => {

        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true
        }));

      })
      .catch(() => {
        logout();
      });

  }, []);

  // 2. Login function: Normalizes the role before saving
  const login = (data) => {

    let normalizedRole = (data.role || 'USER').toUpperCase();

    if (!normalizedRole.startsWith('ROLE_')) {
      normalizedRole = `ROLE_${normalizedRole}`;
    }

    // Save tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', normalizedRole);
    localStorage.setItem('username', data.username);

    setAuthState({
      isAuthenticated: true,
      username: data.username,
      role: normalizedRole
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};