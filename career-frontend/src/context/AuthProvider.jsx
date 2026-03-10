import React, { useState } from 'react';
import { AuthContext } from './AuthContext';

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

  // 2. Login function: Normalizes the role before saving
  const login = (data) => {
    // LOGIC UPDATE: Ensure role is always Uppercase and Prefixed
    let normalizedRole = (data.role || 'USER').toUpperCase();
    if (!normalizedRole.startsWith('ROLE_')) {
      normalizedRole = `ROLE_${normalizedRole}`;
    }

    // Physical Save to Storage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', normalizedRole); // Use normalized version
    localStorage.setItem('username', data.username);

    // Update State
    setAuthState({
      isAuthenticated: true,
      username: data.username,
      role: normalizedRole, // Use normalized version
    });
  };

  // 3. Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setAuthState({
      isAuthenticated: false,
      username: null,
      role: null,
    });
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};