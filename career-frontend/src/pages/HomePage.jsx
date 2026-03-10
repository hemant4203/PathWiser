import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Quick Access Data - Updated 'Starred Items' path to '/bookmark'
  const menuItems = [
    { title: 'Explore Paths', icon: 'bi-compass', path: '/explore', color: '#1E3A8A', desc: 'Browse all career roadmaps' },
    { title: 'Compare Skills', icon: 'bi-layout-split', path: '/compare', color: '#14B8A6', desc: 'Side-by-side career analysis' },
    { 
      title: 'Starred Items', 
      icon: 'bi-bookmark-star', 
      path: '/bookmark', // Updated from '/starred' to '/bookmark'
      color: '#1E3A8A', 
      desc: 'Your saved career paths' 
    },
    { title: 'My Roadmap', icon: 'bi-map', path: '/my-roadmap', color: '#14B8A6', desc: 'Track your current progress' },
  ];

  return (
    <div className="min-vh-100 py-5" 
         style={{ 
           backgroundColor: '#f8fbff',
           backgroundImage: `radial-gradient(#d1dcf0 1px, transparent 1px), radial-gradient(#d1dcf0 1px, #f8fbff 1px)`,
           backgroundSize: '40px 40px' 
         }}>
      
      <div className="container mt-4">
        {/* Welcome Header */}
        <div className="mb-5 text-center text-md-start">
          <h1 className="display-5 fw-bold" style={{ color: '#0F172A', letterSpacing: '-1px' }}>
            Hello, <span style={{ color: '#1E3A8A' }}>{user?.username || 'Learner'}</span>!
          </h1>
          <p className="lead text-secondary">Where would you like to navigate today?</p>
        </div>

        {/* Dynamic Grid */}
        <div className="row g-4">
          {menuItems.map((item, index) => (
            <div className="col-12 col-md-6 col-lg-3" key={index}>
              <div 
                className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 roadmap-card-hover"
                onClick={() => navigate(item.path)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 1rem 3rem rgba(0,0,0,.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                }}
              >
                <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle mx-auto"
                     style={{ width: '70px', height: '70px', backgroundColor: `${item.color}15` }}>
                  <i className={`bi ${item.icon} fs-2`} style={{ color: item.color }}></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#0F172A' }}>{item.title}</h5>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Project Status Card */}
        <div className="mt-5 pt-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <i className="bi bi-rocket-takeoff fs-3 text-success"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Your Project Status</h5>
                  <p className="text-muted mb-0 small">Your final year project is due in 15 days.</p>
                </div>
              </div>
              <button 
                className="btn btn-dark rounded-pill px-4 py-2 mt-3 mt-md-0 fw-bold"
                onClick={() => navigate('/my-roadmap')}
              >
                View Project Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}