import React from 'react';
import AppRouter from './router/AppRouter';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthProvider';
import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;