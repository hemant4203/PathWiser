import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';

export default function MyRoadmapPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserRoadmaps = async () => {
      try {
        setError(null);
        const res = await axiosClient.get('/api/user/roadmaps');
        setRoadmaps(res.data || []);
      } catch (err) {
        console.error("Fetch Error:", err.response?.status || err.message);
        setError("Failed to load roadmaps. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoadmaps();
  }, [isAuthenticated, navigate]);

  const { activeRoadmaps, pendingRoadmaps, rejectedRoadmaps, completedRoadmaps } = useMemo(() => ({
    activeRoadmaps: roadmaps.filter(r => r.status === "IN_PROGRESS" || r.status === "ASSESSMENT_UNLOCKED"),
    pendingRoadmaps: roadmaps.filter(r => r.status === "ASSESSMENT_PENDING"),
    rejectedRoadmaps: roadmaps.filter(r => r.status === "REJECTED"),
    completedRoadmaps: roadmaps.filter(r => r.status === "CERTIFIED")
  }), [roadmaps]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return { text: "IN PROGRESS", class: "bg-primary bg-opacity-10 text-primary" };

      case "ASSESSMENT_UNLOCKED":
        return { text: "ASSESSMENT READY", class: "bg-success bg-opacity-10 text-success" };

      case "ASSESSMENT_PENDING":
        return { text: "UNDER REVIEW", class: "bg-warning bg-opacity-10 text-warning" };

      case "REJECTED":
        return { text: "REVISION REQUIRED", class: "bg-danger bg-opacity-10 text-danger" };

      case "CERTIFIED":
        return { text: "COMPLETED", class: "bg-success bg-opacity-10 text-success" };

      default:
        return { text: status, class: "bg-secondary bg-opacity-10 text-secondary" };
    }
  };

  if (loading) {
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
        <div className="alert alert-danger d-inline-block px-4">{error}</div>
        <br />
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="container pt-5 text-center min-vh-100">
        <h2 className="fw-bold mt-5">No roadmaps found.</h2>
        <p className="text-muted">Go to Explore to start your journey!</p>
        <button
          onClick={() => navigate('/explore')}
          className="btn btn-primary rounded-pill px-4 mt-3"
        >
          Browse Roadmaps
        </button>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light pb-5">
      <div className="container pt-4">

        {/* ACTIVE ROADMAPS */}
        {activeRoadmaps.length > 0 && (
          <section className="mb-5">
            <h5 className="fw-bold mb-4">Active Roadmaps 🚀</h5>

            <div className="row g-4">
              {activeRoadmaps.map((roadmap) => {

                const progress = roadmap.progress?.progressPercentage || 0;
                const status = getStatusBadge(roadmap.status);

                const isReadyForAssessment =
                  progress === 100 || roadmap.status === "ASSESSMENT_UNLOCKED";

                const statusActions = {
                  IN_PROGRESS: () =>
                    navigate(`/my-roadmap/dashboard/${roadmap.roadmapId}`),

                  ASSESSMENT_UNLOCKED: () =>
                    navigate(`/assessment/${roadmap.roadmapId}`)
                };

                const handleClick = () => {
                  const action = statusActions[roadmap.status];
                  if (action) action();
                };

                return (
                  <div key={roadmap.roadmapId} className="col-md-4">
                    <div
                      className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column"
                      style={{ cursor: "pointer" }}
                      onClick={handleClick}
                    >

                      <span
                        className={`badge ${status.class} rounded-pill mb-3 px-3 py-2 fw-bold`}
                        style={{ width: "fit-content" }}
                      >
                        {status.text}
                      </span>

                      <h5 className="fw-bold mb-3">{roadmap.title}</h5>

                      <div className="progress mb-2" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="small text-muted mb-4">
                        Progress: {progress}%
                      </div>

                      <button
                        className="btn btn-primary rounded-pill fw-bold px-4 mt-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick();
                        }}
                      >
                        {isReadyForAssessment
                          ? "Open Assessment →"
                          : "Continue Learning →"}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ASSESSMENT PENDING */}
        {pendingRoadmaps.length > 0 && (
          <section className="mb-5">
            <h5 className="fw-bold mb-4">Assessment Pending ⏳</h5>

            <div className="row g-4">
              {pendingRoadmaps.map((roadmap) => (
                <div key={roadmap.roadmapId} className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-light h-100 d-flex flex-column">

                    <span
                      className="badge bg-warning bg-opacity-10 text-warning rounded-pill mb-2 px-3 py-2 fw-bold"
                      style={{ width: "fit-content" }}
                    >
                      REVIEW IN PROGRESS
                    </span>

                    <h5 className="fw-bold mb-3">{roadmap.title}</h5>

                    <p className="small text-muted mt-auto mb-0">
                      Your assessment submission is under review.
                    </p>

                  </div>

                </div>
              ))}
            </div>
          </section>
        )}

        {/* REVISION REQUIRED */}
        {rejectedRoadmaps.length > 0 && (
          <section className="mb-5">
            <h5 className="fw-bold mb-4 text-danger">
              Revision Required 🔧
            </h5>

            <div className="row g-4">

              {rejectedRoadmaps.map((roadmap) => (
                <div key={roadmap.roadmapId} className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">

                    <span
                      className="badge bg-danger bg-opacity-10 text-danger rounded-pill mb-2 px-3 py-2 fw-bold"
                      style={{ width: "fit-content" }}
                    >
                      REVISION REQUIRED
                    </span>

                    <h5 className="fw-bold mb-3">{roadmap.title}</h5>

                    <p className="text-muted">
                      {roadmap?.reviewComment
                        ? `Admin Feedback: ${roadmap.reviewComment}`
                        : "Your assessment was rejected. Please revise your work or resubmit."}
                    </p>

                    <div className="d-flex gap-2 mt-auto">

                      <button
                        className="btn btn-outline-primary rounded-pill fw-bold w-50"
                        onClick={() =>
                          navigate(`/my-roadmap/dashboard/${roadmap.roadmapId}`)
                        }
                      >
                        Revise
                      </button>

                      <button
                        className="btn btn-primary rounded-pill fw-bold w-50"
                        onClick={() =>
                          navigate(`/assessment/${roadmap.roadmapId}`)
                        }
                      >
                        Resubmit
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          </section>
        )}

        {/* COMPLETED ROADMAPS */}
        {completedRoadmaps.length > 0 && (
          <section>

            <h5 className="fw-bold mb-4">Completed Roadmaps 🏆</h5>

            <div className="row g-4">

              {completedRoadmaps.map((roadmap) => (
                <div key={roadmap.roadmapId} className="col-md-4">

                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">

                    <span
                      className="badge bg-success bg-opacity-10 text-success rounded-pill mb-2 px-3 py-2 fw-bold"
                      style={{ width: "fit-content" }}
                    >
                      MASTERED
                    </span>

                    <h5 className="fw-bold mb-3">{roadmap.title}</h5>

                    <button
                      className="btn btn-success btn-sm rounded-pill px-4 fw-bold mt-auto"
                      onClick={() =>
                        navigate(`/certificate/${roadmap.roadmapId}`)
                      }
                    >
                      View Certificate
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}

      </div>
    </div>
  );
}