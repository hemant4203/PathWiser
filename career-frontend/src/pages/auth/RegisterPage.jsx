import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // VALIDATION STATE
  const [validations, setValidations] = useState({
    length: false,
    number: false,
    specialChar: false,
  });

  // Track password changes to update validations in real-time
  useEffect(() => {
    const { password } = formData;
    setValidations({
      length: password.length >= 8,
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validations.length || !validations.number || !validations.specialChar) {
      setError('Please meet all password requirements.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await axios.post('https://pathwiser-backend.onrender.com/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data;
      setError(serverMessage || 'Username already exists.');
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
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '480px', width: '90%', borderTop: '5px solid #1E3A8A' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#0F172A', letterSpacing: '-1px' }}>Create Account</h2>
            <p className="text-muted small">Secure your <span style={{color: '#1E3A8A', fontWeight:'700'}}>Path</span><span style={{color: '#14B8A6', fontWeight:'700'}}>Wiser</span> account</p>
          </div>

          {error && <div className="alert alert-danger border-0 small text-center mb-4">{error}</div>}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">USERNAME</label>
              <input type="text" className="form-control bg-light border-0 py-2 shadow-none" required onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            
            <div className="mb-2">
              <label className="form-label small fw-bold text-secondary">PASSWORD</label>
              <input type="password" className="form-control bg-light border-0 py-2 shadow-none" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            {/* PASSWORD VALIDATION CHECKLIST */}
            <div className="mb-4 p-2 rounded-3 bg-light bg-opacity-50">
              <div className="small mb-1 fw-bold text-secondary" style={{ fontSize: '0.75rem' }}>REQUIREMENTS:</div>
              <div className={`small ${validations.length ? 'text-success' : 'text-muted'}`}>
                <i className={`bi ${validations.length ? 'bi-check-circle-fill' : 'bi-circle'} me-2`}></i>
                At least 8 characters
              </div>
              <div className={`small ${validations.number ? 'text-success' : 'text-muted'}`}>
                <i className={`bi ${validations.number ? 'bi-check-circle-fill' : 'bi-circle'} me-2`}></i>
                Contains a number
              </div>
              <div className={`small ${validations.specialChar ? 'text-success' : 'text-muted'}`}>
                <i className={`bi ${validations.specialChar ? 'bi-check-circle-fill' : 'bi-circle'} me-2`}></i>
                Contains a special character
              </div>
            </div>

            <button className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" 
                    style={{ backgroundColor: '#1E3A8A', border: 'none' }} 
                    disabled={loading || !validations.length || !validations.number || !validations.specialChar}>
              {loading ? 'Processing...' : 'Register Now'}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">Have an account? </span>
            <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: '#14B8A6' }}>Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}