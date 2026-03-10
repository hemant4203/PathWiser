import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function MyRoadmapPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoadmaps = async () => {
      try {
        const res = await axiosClient.get('/api/user/roadmap/active'); 
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setRoadmaps(data);
      } catch (err) {
        console.error("Fetch Error:", err.response?.status || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserRoadmaps();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const activeRoadmap = roadmaps.find(r => r.progress.progressPercentage < 100);
  const completedRoadmaps = roadmaps.filter(r => r.progress.progressPercentage === 100);

  const dashboard = useMemo(() => {
    if (!activeRoadmap) return null;
    try {
      const modules = JSON.parse(activeRoadmap.structureJson);
      const completedIds = activeRoadmap.completedSubtopicIds || [];
      const enrichedModules = modules.map(mod => {
        const allSubtopics = mod.topics.flatMap(t => t.subtopics);
        const doneCount = allSubtopics.filter(s => completedIds.includes(s.id)).length;
        let status = "Upcoming";
        if (doneCount === allSubtopics.length && allSubtopics.length > 0) status = "Completed";
        else if (doneCount > 0) status = "In Progress";
        return { ...mod, status, doneCount, total: allSubtopics.length, allSubtopics };
      });
      const nextStep = enrichedModules.flatMap(m => m.allSubtopics).find(s => !completedIds.includes(s.id));
      const activeModule = enrichedModules.find(m => m.status !== "Completed") || enrichedModules[0];
      return { ...activeRoadmap, enrichedModules, nextStep, activeModule };
    } catch (e) {
      console.error("JSON Parse Error", e);
      return null;
    }
  }, [activeRoadmap]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  if (roadmaps.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>No active roadmap found.</h3>
        <p className="text-muted text-secondary">Go to Explore to start your journey!</p>
        <button onClick={() => navigate('/explore')} className="btn btn-primary rounded-pill px-4">Browse Roadmaps</button>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      {dashboard && (
        <>
          {/* POLISHED PROGRESS SECTION */}
          <div className="bg-white border-bottom sticky-top py-4 shadow-sm mb-4" style={{ zIndex: 1020 }}>
            <div className="container">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-primary small" style={{ letterSpacing: '0.8px' }}>JOURNEY PROGRESS</span>
                <span className="fw-bold text-dark small">{dashboard.progress.progressPercentage}% completed</span>
              </div>
              <div className="progress rounded-pill shadow-none" style={{ height: '12px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <div 
                  className="progress-bar rounded-pill shadow-sm" 
                  role="progressbar" 
                  style={{ 
                    width: `${dashboard.progress.progressPercentage}%`, 
                    backgroundColor: '#2563eb',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.15)'
                  }} 
                  aria-valuenow={dashboard.progress.progressPercentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div className="container">
            {/* ACTION CARD */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
              <div className="mb-1">
                <span className="text-primary fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>{dashboard.title}</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-warning bg-opacity-10 text-warning p-1">🔥</span>
                <span className="text-primary fw-bold small text-uppercase">Next Step</span>
              </div>
              <h5 className="text-secondary mb-1">{dashboard.activeModule.title}</h5>
              <h2 className="fw-bold mb-4">{dashboard.nextStep?.title || "All Topics Finished!"}</h2>
              <button className="btn btn-primary rounded-pill w-100 py-2 fw-bold" onClick={() => navigate(`/learning/${dashboard.roadmapId}/${dashboard.nextStep?.id}`)}>
                Continue Learning →
              </button>
            </div>

            {/* MILESTONES */}
            <div className="mb-4">
              <h6 className="text-muted small fw-bold mb-3">MAIN PATH MILESTONES</h6>
              <div className="row g-3">
                {dashboard.enrichedModules.map(m => (
                  <div key={m.id} className="col-md-4">
                    <div className={`card h-100 border-0 shadow-sm p-3 ${m.status === 'Completed' ? 'bg-success bg-opacity-10' : ''}`}>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${m.status === 'Completed' ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                        <span className="fw-bold small">{m.title}</span>
                      </div>
                      <div className="small mt-2 text-primary fw-medium">{m.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TASK LIST */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
              <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between">
                <h5 className="fw-bold mb-0">Subtopic Steps</h5>
                <span className="text-muted small">{dashboard.activeModule.total} Tasks Total</span>
              </div>
              <div className="list-group list-group-flush">
                {dashboard.activeModule.allSubtopics.map((s, index) => (
                  <div key={s.id} className="list-group-item p-4 d-flex justify-content-between align-items-center border-0 border-bottom cursor-pointer" onClick={() => navigate(`/learning/${dashboard.roadmapId}/${s.id}`)}>
                    <div className="d-flex gap-3 align-items-center">
                       <div className={`rounded-circle d-flex align-items-center justify-content-center ${dashboard.completedSubtopicIds.includes(s.id) ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{width: '24px', height: '24px', fontSize: '12px'}}>
                          {dashboard.completedSubtopicIds.includes(s.id) ? '✓' : index + 1}
                       </div>
                       <div>
                          <h6 className={`fw-bold mb-0 ${dashboard.completedSubtopicIds.includes(s.id) ? 'text-muted text-decoration-line-through' : ''}`}>{s.title}</h6>
                          <small className="text-muted">Module {dashboard.activeModule.id}</small>
                       </div>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${dashboard.completedSubtopicIds.includes(s.id) ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-secondary'}`}>
                      {dashboard.completedSubtopicIds.includes(s.id) ? 'COMPLETED' : 'NOT STARTED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* COMPLETED ROADMAPS SECTION */}
      {completedRoadmaps.length > 0 && (
        <div className="container mt-4">
          <h5 className="fw-bold text-dark mb-4">Completed Roadmaps 🏆</h5>
          <div className="row g-4">
            {completedRoadmaps.map((roadmap) => (
              <div key={roadmap.id} className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <span className="badge bg-success bg-opacity-10 text-success rounded-pill mb-2 px-3 py-2 fw-bold" style={{ width: 'fit-content' }}>MASTERED</span>
                  <h5 className="fw-bold mb-3">{roadmap.title}</h5>
                  <button className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold" onClick={() => navigate(`/learning/${roadmap.roadmapId}/${roadmap.completedSubtopicIds[0]}`)}>
                    Revisit Roadmap
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}