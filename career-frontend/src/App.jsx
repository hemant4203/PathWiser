import AppRouter from './router/AppRouter';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;