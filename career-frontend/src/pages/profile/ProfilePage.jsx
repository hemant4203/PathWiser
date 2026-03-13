import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // NEW: State to capture the specific backend error message
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setBackendError(null);
        const res = await axiosClient.get('/api/user/profile');
        setProfile(res.data);
      } catch (err) {
        // LOGIC UPDATE: Capture the exact 403 message from your SecurityConfig
        const errorMessage = err.response?.data?.message || "Could not load data from /api/user/profile.";
        setBackendError(errorMessage);
        console.error("Profile Fetch Error:", err.response?.status, errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]); 

  const getAvatarUrl = (name) => {
    if (!name) return 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Unknown';
    const firstLetter = name.trim().charAt(0).toUpperCase();
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${firstLetter}&backgroundColor=e2e8f0`;
  };

  if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>;
  
  // LOGIC UPDATE: Improved Error UI that shows your specific Backend message
  if (!profile) return (
    <div className="container py-5 text-center mt-5">
      <div className="mb-4">
        <i className="bi bi-exclamation-octagon-fill text-danger" style={{ fontSize: '4rem' }}></i>
      </div>
      <h3 className="text-danger fw-bold">Backend API Error</h3>
      <p className="text-muted fs-5">{backendError}</p>
      <button className="btn btn-outline-primary mt-3 rounded-pill px-4" onClick={() => window.location.reload()}>
        <i className="bi bi-arrow-clockwise me-2"></i>Retry Connection
      </button>
    </div>
  );

    const { 
    username, 
    activeRoadmapTitle, 
    completedRoadmaps, 
    completedSubtopics, 
    progressPercentage, 
    totalSubtopics, 
    recentCompletedSubtopics = [],
    completedRoadmapsList = [] 
  } = profile;
  const safeProgress = progressPercentage || 0;
  const safeTotal = totalSubtopics || 0;
  const safeCompletedCount = completedRoadmaps || 0;

  const displayCompletedRoadmaps = completedRoadmapsList?.length > 0
    ? completedRoadmapsList
    : Array.from({ length: safeCompletedCount || 0 }, (_, i) => ({
        roadmapId: null,
        title: `Mastered Path #${i + 1}`
      }));
  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="bg-primary bg-gradient position-relative" style={{ height: '180px' }}>
        <div className="container h-100 d-flex align-items-center">
          <h2 className="fw-bold text-white mb-4">My Dashboard</h2>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-60px' }}>
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow rounded-4 p-4 text-center mb-4 bg-white position-relative">
              <div 
                className="mx-auto rounded-circle shadow bg-light border border-4 border-white overflow-hidden d-flex align-items-center justify-content-center"
                style={{ width: '110px', height: '110px', marginTop: '-60px' }}
              >
                <img 
                  src={getAvatarUrl(username)} 
                  alt={`${username}'s avatar`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <h4 className="fw-bold mb-1 mt-3 text-capitalize">{username}</h4>
              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold mb-3">
                <i className="bi bi-star-fill me-1"></i> Active Explorer
              </span>
              
              <div className="row mt-3 border-top pt-4">
                <div className="col-6 border-end">
                  <h3 className="fw-bold text-primary mb-0">{safeCompletedCount}</h3>
                  <p className="text-muted small text-uppercase fw-bold mb-0" style={{ letterSpacing: '0.5px' }}>Roadmaps<br/>Mastered</p>
                </div>
                <div className="col-6">
                  <h3 className="fw-bold text-success mb-0">{completedSubtopics || 0}</h3>
                  <p className="text-muted small text-uppercase fw-bold mb-0" style={{ letterSpacing: '0.5px' }}>Topics<br/>Finished</p>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold mb-3 text-uppercase small text-muted d-flex align-items-center">
                <i className="bi bi-award-fill text-warning me-2 fs-5"></i> Hall of Fame
              </h6>
              {displayCompletedRoadmaps.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {displayCompletedRoadmaps.map((roadmp, i) => (
                    <div key={i} className="bg-light rounded-3 p-3 d-flex align-items-center border border-light transition-all" style={{ cursor: 'default' }}>
                      <div className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px', minWidth: '35px' }}>
                        <i className="bi bi-trophy-fill text-warning"></i>
                      </div>
                      <span className="fw-bold text-dark small">{roadmp.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="fs-1 opacity-25 mb-2">🏅</div>
                  <small className="text-muted">Complete a roadmap to earn your first trophy!</small>
                </div>
              )}
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mt-4">
            <h6 className="fw-bold mb-3 text-uppercase small text-muted d-flex align-items-center">
              <i className="bi bi-patch-check-fill text-primary me-2 fs-5"></i> Certifications
            </h6>

            {displayCompletedRoadmaps.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {displayCompletedRoadmaps.map((roadmap, i) => (
                  <div
                    key={i}
                    className="bg-light rounded-3 p-3 d-flex align-items-center justify-content-between border"
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '35px', height: '35px', minWidth: '35px' }}
                      >
                        <i className="bi bi-patch-check-fill"></i>
                      </div>

                      <div>
                        <span className="fw-bold text-dark small d-block">{roadmap.title}</span>
                        <small className="text-muted">Certified</small>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill fw-bold px-3"
                      onClick={() => roadmap.roadmapId && navigate(`/certificate/${roadmap.roadmapId}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="fs-1 opacity-25 mb-2">🎓</div>
                <small className="text-muted">
                  Complete a roadmap to earn your first certificate!
                </small>
              </div>
            )}
          </div>
          </div>

          <div className="col-lg-8">
            {activeRoadmapTitle ? (
              <div className="card border-0 shadow rounded-4 p-4 p-lg-5 mb-4 bg-white overflow-hidden position-relative">
                <div className="position-absolute top-0 end-0 p-4 opacity-10">
                  <i className="bi bi-compass-fill" style={{ fontSize: '8rem' }}></i>
                </div>

                <div className="position-relative z-1">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-uppercase text-muted small mb-0">Current Mission</h6>
                    <span className="badge bg-primary px-3 py-2 rounded-pill fw-bold shadow-sm">
                      IN PROGRESS
                    </span>
                  </div>
                  
                  <h2 className="fw-bold mb-4 text-dark display-6">{activeRoadmapTitle}</h2>

                  <div className="bg-light rounded-4 p-4 mb-4 border">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <div>
                        <span className="text-dark fw-bold d-block">Overall Completion</span>
                        <span className="text-muted small">{completedSubtopics} of {safeTotal} Modules</span>
                      </div>
                      <h3 className="text-primary fw-bold mb-0">{safeProgress}%</h3>
                    </div>
                    <div className="progress rounded-pill shadow-inner" style={{ height: '12px', backgroundColor: '#e9ecef' }}>
                      <div 
                        className="progress-bar bg-primary progress-bar-striped progress-bar-animated" 
                        style={{ width: `${safeProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-end">
                     <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" onClick={() => navigate('/my-roadmap')}>
                       Continue Journey <i className="bi bi-arrow-right ms-2"></i>
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 p-5 mb-4 bg-white text-center">
                <div className="display-1 mb-3 opacity-50">🚀</div>
                <h3 className="fw-bold text-dark">Ready for a new adventure?</h3>
                <p className="text-secondary mb-4 fs-5">You are not enrolled in any active roadmaps.</p>
                <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm" onClick={() => navigate('/explore')}>
                  Explore Careers
                </button>
              </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-info bg-opacity-10 text-info rounded-3 p-2 me-3">
                  <i className="bi bi-activity fs-4"></i>
                </div>
                <h5 className="fw-bold mb-0">Recent Milestones</h5>
              </div>
              
              {(recentCompletedSubtopics?.length || 0) > 0 ? (
                <div className="position-relative ms-3 mt-3">
                  <div
                    className="position-absolute h-100 border-start border-2 border-primary border-opacity-25"
                    style={{ left: '15px', top: '10px' }}
                  ></div>

                  {recentCompletedSubtopics.map((taskTitle, index) => (
                    <div key={index} className="d-flex mb-4 position-relative z-1">
                      <div
                        className="bg-white border border-primary border-3 rounded-circle mt-1 d-flex align-items-center justify-content-center text-primary shadow-sm"
                        style={{ width: '32px', height: '32px', minWidth: '32px', zIndex: 2 }}
                      >
                        <i className="bi bi-check-lg" style={{ fontSize: '18px', fontWeight: 'bold' }}></i>
                      </div>

                      <div className="ms-4 bg-light rounded-4 p-3 w-100 border">
                        <h6 className="fw-bold mb-1 text-dark">
                          {typeof taskTitle === 'string' ? taskTitle : taskTitle.title}
                        </h6>
                        <span className="badge bg-success bg-opacity-10 text-success small">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                  <i className="bi bi-clock-history fs-1 text-muted opacity-25 mb-3 d-block"></i>
                  <h6 className="fw-bold text-dark">No recent activity</h6>
                  <p className="text-muted small mb-0">
                    Your latest conquered topics will appear here.
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}