import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State to handle the profile dropdown manually in React
  const [showDropdown, setShowDropdown] = useState(false);

  // Helper to dynamically set the top header title based on the URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('users')) return 'Users Management';
    if (path.includes('roadmaps')) return 'Roadmaps';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  // Navigation Links configuration for the sidebar
  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-fill' },
    { name: 'Users', path: '/admin/users', icon: 'bi-people-fill' },
    { name: 'Roadmaps', path: '/admin/roadmaps', icon: 'bi-map-fill' },
    { name: 'Settings', path: '/admin/settings', icon: 'bi-gear-fill' },
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      
      {/* 1. FIXED SIDEBAR */}
      <div 
        className="d-flex flex-column flex-shrink-0 shadow-sm" 
        style={{ width: '260px', backgroundColor: '#1e293b', zIndex: 1040 }}
      >
        {/* Logo Area */}
        <div className="d-flex align-items-center p-4 text-white text-decoration-none border-bottom border-secondary border-opacity-25">
          <div className="bg-primary rounded d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-compass-fill text-white fs-5"></i>
          </div>
          <span className="fs-5 fw-bold">CGP Admin</span>
        </div>

        {/* Navigation Links */}
        <ul className="nav nav-pills flex-column mb-auto p-3 gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name} className="nav-item">
                <Link 
                  to={link.path} 
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-white transition-all ${isActive ? 'bg-primary shadow-sm fw-bold' : 'opacity-75 hover-opacity-100'}`}
                  style={{ backgroundColor: isActive ? '#3b82f6' : 'transparent' }}
                >
                  <i className={`bi ${link.icon} fs-5`}></i>
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Logout Button */}
        <div className="p-3 border-top border-secondary border-opacity-25">
          <button 
            onClick={handleLogout}
            className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-3 w-100 px-3 opacity-75 hover-opacity-100"
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
            Logout
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white border-bottom shadow-sm py-3 px-4 d-flex justify-content-between align-items-center" style={{ zIndex: 1030 }}>
          
          <h4 className="fw-bold mb-0 text-dark">{getPageTitle()}</h4>
          
          <div className="d-flex align-items-center gap-4">
            {/* Notification Bell */}
            <div className="position-relative cursor-pointer text-secondary">
              <i className="bi bi-bell-fill fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="position-relative">
              <div 
                className="d-flex align-items-center gap-2 cursor-pointer" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ cursor: 'pointer' }}
              >
                <div className="text-end d-none d-md-block">
                  <h6 className="mb-0 fw-bold text-dark">{user?.name || 'Admin'}</h6>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>Super Admin</small>
                </div>
                <img 
                  src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user?.name || 'Admin'}&backgroundColor=e2e8f0`} 
                  alt="Admin Avatar" 
                  className="rounded-circle border"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <i className="bi bi-chevron-down text-muted small"></i>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-2" style={{ minWidth: '220px', zIndex: 1050 }}>
                  <div className="d-flex align-items-center gap-3 p-2 border-bottom mb-2">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user?.name || 'Admin'}&backgroundColor=e2e8f0`} 
                      alt="Admin" 
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{user?.name || 'Admin User'}</h6>
                      <small className="text-muted">admin@pathwiser.com</small>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-white text-danger w-100 text-start px-3 py-2 d-flex align-items-center gap-2 fw-bold"
                  >
                    <i className="bi bi-power"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC PAGE CONTENT (The Outlet) */}
        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}