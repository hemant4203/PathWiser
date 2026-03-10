import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* SECTION 1: Top Background (Hero) */}
      {/* Uses a modern soft blue gradient and extra bottom padding */}
      <div 
        className="w-100" 
        style={{ 
          background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fbff 100%)',
          paddingTop: '6vh',
          paddingBottom: '10rem' // Creates the space for the cards to overlap
        }}
      >
        <div className="container d-flex flex-column justify-content-center align-items-center text-center">
          
          {/* Top Badge */}
          <span className="badge bg-white text-primary rounded-pill px-3 py-2 mb-4 shadow-sm border border-primary-subtle fw-medium">
            ✨ AI-Powered Career Planning
          </span>
          
          {/* Main Headline */}
          <h1 className="display-4 fw-bold text-dark mb-4" style={{ letterSpacing: '-1px' }}>
            Navigate Your <span className="text-primary">Career Path</span>
          </h1>
          
          {/* Subtitle */}
          <p className="lead text-secondary mb-5 col-md-8 col-lg-6 mx-auto" style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            Stop guessing your next move. Compare software engineering trajectories, analyze real-world metrics, and build your professional roadmap side-by-side.
          </p>
          
          {/* Action Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center w-100">
            <button 
              onClick={() => navigate('/register')} 
              className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-sm"
              style={{ transition: 'transform 0.2s', width: 'auto' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get Started
            </button>
            
            <button 
              onClick={() => navigate('/explore')} 
              className="btn btn-white btn-lg rounded-pill px-5 py-3 fw-bold bg-white text-primary shadow-sm"
              style={{ transition: 'transform 0.2s', width: 'auto', border: '1px solid #dee2e6' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Explore Roadmaps
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Bottom Background (Crisp White) */}
      <div className="flex-grow-1" style={{ backgroundColor: '#ffffff' }}>
        
        {/* The Card Container - The negative margin pulls it up over the gradient! */}
        <div className="container pb-5 mb-5" style={{ marginTop: '-6rem' }}>
          <div className="row g-4">
            
            {/* Card 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow rounded-4 text-center p-4 bg-white" style={{ transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="mb-4 mt-2">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-diagram-3 fs-2 text-primary"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-2">Structured Paths</h5>
                <p className="text-muted small mb-2 px-2">Detailed roadmaps for Full-Stack, Java, and AI specializations.</p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow rounded-4 text-center p-4 bg-white" style={{ transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="mb-4 mt-2">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-layout-split fs-2 text-primary"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-2">Side-by-Side</h5>
                <p className="text-muted small mb-2 px-2">Compare up to three career trajectories instantly to find your fit.</p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow rounded-4 text-center p-4 bg-white" style={{ transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="mb-4 mt-2">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-lightning-charge fs-2 text-primary"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-2">Smart Insights</h5>
                <p className="text-muted small mb-2 px-2">Get accurate entry difficulty and salary growth potential metrics.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}