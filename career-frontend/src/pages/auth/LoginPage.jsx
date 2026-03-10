import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/useAuth'; 
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('https://pathwiser-backend.onrender.com/api/auth/login', formData);

      // Extract token first
      const token = res.data.accessToken || res.data.token;

      // Decode JWT
      const decoded = jwtDecode(token);


      let normalizedRole = decoded.role;

      if (!normalizedRole) {
        normalizedRole = "ROLE_USER";
      } else {
        normalizedRole = normalizedRole.toUpperCase();

        if (!normalizedRole.startsWith("ROLE_")) {
          normalizedRole = `ROLE_${normalizedRole}`;
        }
      }

      // SYNCHRONOUS STORAGE
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('username', res.data.username || formData.username);

      if (res.data.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }

      // Update Auth Context
      login({
        accessToken: token,
        refreshToken: res.data.refreshToken,
        role: normalizedRole,
        username: res.data.username || formData.username
      });

      // Redirect
      navigate('/', { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const gridStyle = {
    backgroundColor: '#f8fbff',
    backgroundImage: `radial-gradient(#d1dcf0 1px, transparent 1px), radial-gradient(#d1dcf0 1px, #f8fbff 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 20px 20px',
    minHeight: '100vh'
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={gridStyle}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '420px', width: '90%', borderTop: '5px solid #14B8A6' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-shield-lock-fill fs-2" style={{ color: '#1E3A8A' }}></i>
            </div>
            <h2 className="fw-bold" style={{ color: '#0F172A', letterSpacing: '-1px' }}>Welcome Back</h2>
            <p className="text-muted small">Log in to <span style={{color: '#1E3A8A', fontWeight:'700'}}>Path</span><span style={{color: '#14B8A6', fontWeight:'700'}}>Wiser</span></p>
          </div>

          {error && <div className="alert alert-danger border-0 small text-center mb-4">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">USERNAME</label>
              <input 
                type="text" 
                className="form-control bg-light border-0 py-2 shadow-none" 
                required 
                autoComplete="username"
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">PASSWORD</label>
              <input 
                type="password" 
                className="form-control bg-light border-0 py-2 shadow-none" 
                required 
                autoComplete="current-password"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
            <button 
              className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" 
              style={{ backgroundColor: '#1E3A8A', border: 'none' }} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">New to PathWiser? </span>
            <Link to="/register" className="small fw-bold text-decoration-none" style={{ color: '#1E3A8A' }}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}