import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth'; 

export default function Navbar() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  
  // 1. UPDATED: Destructure our new strict state variables
  const { isAuthenticated, username, role, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const closeNav = () => setIsNavCollapsed(true);

  const handleLogout = () => {
    logout(); 
    closeNav();
    // navigate('/login') is handled inside the logout function in useAuth, but keeping it here is fine as a fallback
    navigate('/login'); 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3" style={{zIndex: 1050}}>
      <div className="container">
        
        {/* BRAND LOGO */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={closeNav}>
          <svg width="42" height="42" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="gap-mask">
                <rect width="400" height="400" fill="white" />
                <rect x="185" y="60" width="30" height="30" fill="black" />
                <rect x="185" y="310" width="30" height="30" fill="black" />
                <rect x="60" y="185" width="30" height="30" fill="black" />
                <rect x="310" y="185" width="30" height="30" fill="black" />
              </mask>
            </defs>
            <circle cx="200" cy="200" r="125" stroke="#1E3A8A" strokeWidth="22" mask="url(#gap-mask)" />
            <g stroke="#1E3A8A" strokeWidth="12" strokeLinecap="butt">
              <line x1="200" y1="55" x2="200" y2="95" /><line x1="200" y1="305" x2="200" y2="345" /> 
              <line x1="55" y1="200" x2="95" y2="200" /><line x1="305" y1="200" x2="345" y2="200" /> 
            </g>
            <g transform="translate(200, 200) rotate(42)">
              <path d="M0 -145 L40 0 L0 -18 L-40 0 Z" fill="#14B8A6"/> 
              <path d="M0 -145 L0 -18 L-40 0 Z" fill="#0D9488"/> 
              <path d="M0 145 L-40 0 L0 18 L40 0 Z" fill="#1E3A8A"/> 
              <path d="M0 145 L0 18 L40 0 Z" fill="#172554"/> 
              <ellipse cx="0" cy="0" rx="14" ry="22" fill="white"/>
            </g>
          </svg>
          <span className="fs-3 ms-1" style={{ letterSpacing: '-0.8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span style={{ color: '#1E3A8A', fontWeight: '800' }}>Path</span>
            <span style={{ color: '#14B8A6', fontWeight: '800' }}>Wiser</span>
          </span>
        </Link>

        {/* MOBILE TOGGLE */}
        <button className="navbar-toggler border-0 shadow-none px-0" type="button" onClick={handleNavCollapse}>
          {isNavCollapsed ? <span className="navbar-toggler-icon"></span> : <i className="bi bi-x-lg fs-2 text-dark"></i>}
        </button>

        {/* NAVIGATION LINKS */}
        <div className={`${isNavCollapsed ? 'collapse' : 'collapse show'} navbar-collapse`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2 gap-lg-4 text-center mt-3 mt-lg-0">
            {/* PUBLIC LINKS: Visible to everyone */}
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/" onClick={closeNav}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/explore" onClick={closeNav}>
                Explore
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/compare" onClick={closeNav}>
                Compare
              </NavLink>
            </li>

            {/* 2. USER LINKS: Only visible if logged in and NOT an admin */}
            {isAuthenticated && role !== 'ADMIN' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/bookmark" onClick={closeNav}>
                    Bookmark
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/my-roadmap" onClick={closeNav}>
                    My Roadmap
                  </NavLink>
                </li>
              </>
            )}

            {/* 3. ADMIN LINKS: Only visible if logged in AS an admin */}
            {isAuthenticated && role === 'ADMIN' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} to="/admin/dashboard" onClick={closeNav}>
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* TOP RIGHT PROFILE OPTIONS */}
          <div className="d-flex justify-content-center mt-3 mt-lg-0 gap-2">
            
            {/* 4. CHECK AUTH STATUS INSTEAD OF USER OBJECT */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {/* Pull username straight from state */}
                  {username || 'Profile'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3">
                  
                  {/* Dynamic Profile Dropdown Links */}
                  {role === 'ADMIN' ? (
                    <li><Link className="dropdown-item" to="/admin/dashboard" onClick={closeNav}>Go to Dashboard</Link></li>
                  ) : (
                    <li><Link className="dropdown-item" to="/profile" onClick={closeNav}>My Profile</Link></li>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn btn-primary rounded-pill px-4 fw-bold" 
                style={{ backgroundColor: '#1E3A8A', border: 'none' }} 
                onClick={closeNav}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}