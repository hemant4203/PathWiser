import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function MyRoadmapDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { roadmapId } = useParams();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchRoadmap = async () => {
      try {
        setError(null);
        const res = await axiosClient.get(`/api/user/roadmap/${roadmapId}`);
        setRoadmap(res.data);
      } catch (err) {
        console.error("Fetch Error:", err.response?.status || err.message);
        setError("Failed to load your roadmap dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [isAuthenticated, authLoading, roadmapId, navigate]);

  const isRevision = roadmap?.status === "REJECTED";

  const dashboard = useMemo(() => {
    if (!roadmap) return null;

    try {
      const modules = JSON.parse(roadmap.structureJson);
      const completedIds = roadmap.completedSubtopicIds || [];
      const progressPercentage = roadmap.progress?.progressPercentage || 0;

      const enrichedModules = modules.map(mod => {
        const allSubtopics = mod.topics?.flatMap(t => t.subtopics) || [];
        const doneCount = allSubtopics.filter(s => completedIds.includes(s.id)).length;

        let status = "Upcoming";
        if (doneCount === allSubtopics.length && allSubtopics.length > 0) {
          status = "Completed";
        } else if (doneCount > 0) {
          status = "In Progress";
        }

        return {
          ...mod,
          status,
          doneCount,
          total: allSubtopics.length,
          allSubtopics
        };
      });

      const nextStep = enrichedModules
        .flatMap(m => m.allSubtopics)
        .find(s => !completedIds.includes(s.id));

      // If all modules are completed, default to the last module for the view
      const activeModule = 
        enrichedModules.find(m => m.status !== "Completed") || 
        enrichedModules[enrichedModules.length - 1];

      return {
        ...roadmap,
        progressPercentage,
        completedIds,
        enrichedModules,
        nextStep,
        activeModule
      };

    } catch (e) {
      console.error("JSON Parse Error", e);
      return null;
    }
  }, [roadmap]);

  // --- UI STATES ---
  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container pt-5 text-center min-vh-100">
        <div className="alert alert-danger d-inline-block px-5">{error}</div>
        <br />
        <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container pt-5 text-center min-vh-100">
        <h3 className="fw-bold text-muted">Roadmap not found or corrupted data.</h3>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/my-roadmap')}>
          Back to My Roadmaps
        </button>
      </div>
    );
  }

  // --- MAIN RENDER ---
  const isFullyCompleted = dashboard.progressPercentage === 100;

  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* PROGRESS BAR */}
      <div className="bg-white border-bottom sticky-top py-4 shadow-sm mb-4" style={{ zIndex: 1020 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-primary small" style={{ letterSpacing: '0.8px' }}>
              JOURNEY PROGRESS
            </span>
            <span className="fw-bold text-dark small">
              {dashboard.progressPercentage}% completed
            </span>
          </div>
          <div className="progress rounded-pill shadow-none" style={{ height: '12px', backgroundColor: '#f1f5f9' }}>
            <div
              className="progress-bar rounded-pill shadow-sm"
              style={{
                width: `${dashboard.progressPercentage}%`,
                backgroundColor: isFullyCompleted ? '#10b981' : '#2563eb' // Turns green at 100%
              }}
            />
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* ACTION CARD */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
          <div className="mb-1">
            <span className="text-primary fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>
              {dashboard.title}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-warning bg-opacity-10 text-warning p-1">
              {isFullyCompleted ? "🏆" : "🔥"}
            </span>
            <span className="text-primary fw-bold small text-uppercase">
              {isFullyCompleted ? "Ready for Final Assessment" : "Next Step"}
            </span>
          </div>

          <h5 className="text-secondary mb-1">
            {dashboard.activeModule?.title || "Course Completed"}
          </h5>
          <h2 className="fw-bold mb-4">
            {dashboard.nextStep?.title || "All Topics Finished!"}
          </h2>

          <button
            className={`btn rounded-pill w-100 py-3 fw-bold ${
              isRevision ? "btn-warning" : isFullyCompleted ? "btn-success" : "btn-primary"
            }`}
            onClick={() => {
              if (isRevision) {

                const firstSubtopic =
                  dashboard?.enrichedModules?.[0]?.allSubtopics?.[0];

                if (firstSubtopic) {
                  navigate(`/learning/${roadmapId}/${firstSubtopic.id}`);
                }

              } else if (isFullyCompleted) {

                navigate(`/assessment/${roadmapId}`);

              } else if (dashboard?.nextStep) {

                navigate(`/learning/${roadmapId}/${dashboard.nextStep.id}`);

              }
            }}
          >
            {isRevision
              ? "Continue Revision →"
              : isFullyCompleted
              ? "Open Assessment →"
              : "Continue Learning →"}
          </button>
        </div>

        {/* MODULE MILESTONES */}
        <div className="mb-4">
          <h6 className="text-muted small fw-bold mb-3 text-uppercase">Main Path Milestones</h6>
          <div className="row g-3">
            {dashboard.enrichedModules.map(m => (
              <div key={m.id} className="col-md-4">
                <div className={`card h-100 border-0 shadow-sm p-3 ${m.status === 'Completed' ? 'bg-success bg-opacity-10' : ''}`}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${m.status === 'Completed' ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`} />
                    <span className="fw-bold small">{m.title}</span>
                  </div>
                  <div className={`small mt-2 fw-medium ${m.status === 'Completed' ? 'text-success' : 'text-primary'}`}>
                    {m.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBTOPIC TASK LIST */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Module Tasks</h5>
            <span className="text-muted small">
              {dashboard.activeModule?.total || 0} Tasks Total
            </span>
          </div>

          <div className="list-group list-group-flush">
            {dashboard.activeModule?.allSubtopics.map((s, index) => {
              const isDone = dashboard.completedIds.includes(s.id);
              
              return (
                <div
                  key={s.id}
                  className="list-group-item p-4 d-flex justify-content-between align-items-center border-0 border-bottom"
                  style={{ cursor: "pointer", transition: "0.2s" }}
                  onClick={() => navigate(`/learning/${roadmapId}/${s.id}`)}
                >
                  <div className="d-flex gap-3 align-items-center">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                        isDone ? 'bg-success text-white' : 'bg-light text-muted'
                      }`}
                      style={{ width: '28px', height: '28px', fontSize: '13px' }}
                    >
                      {isDone ? '✓' : index + 1}
                    </div>
                    <div>
                      <h6 className={`fw-bold mb-0 ${isDone ? 'text-muted text-decoration-line-through' : ''}`}>
                        {s.title}
                      </h6>
                    </div>
                  </div>
                  <span className={`badge rounded-pill px-3 py-2 ${isDone ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-secondary'}`}>
                    {isDone ? 'COMPLETED' : 'NOT STARTED'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}