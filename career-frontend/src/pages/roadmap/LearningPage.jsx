import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/useAuth';
import { toast } from "react-toastify";

export default function LearningPage() {

  const { roadmapId, subtopicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await axiosClient.get(`/api/user/roadmap/${roadmapId}`);
      setRawData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, subtopicId]);

  const pageData = useMemo(() => {

    if (!rawData) return null;

    const modules = JSON.parse(rawData.structureJson);
    const completedIds = rawData.completedSubtopicIds || [];

    const allSubtopics = modules.flatMap(m =>
      m.topics.flatMap(t => t.subtopics)
    );

    const currentIndex = allSubtopics.findIndex(s => s.id === subtopicId);

    const prevTopic = allSubtopics[currentIndex - 1];
    const nextTopic = allSubtopics[currentIndex + 1];

    let currentSubtopic = allSubtopics[currentIndex];

    let currentModule = null;
    let currentTopic = null;

    modules.forEach(m => {
      m.topics.forEach(t => {
        if (t.subtopics.some(s => s.id === subtopicId)) {
          currentModule = m;
          currentTopic = t;
        }
      });
    });

    return {
      roadmapTitle: rawData.title,
      progress: rawData.progress,
      currentModule,
      currentTopic,
      currentSubtopic,
      completedIds,
      prevTopicId: prevTopic?.id,
      nextTopicId: nextTopic?.id,
      totalSteps: allSubtopics.length,
      currentStepIndex: currentIndex + 1,
      allSubtopicsOrdered: allSubtopics
    };

  }, [rawData, subtopicId]);

  const handleMarkComplete = async () => {

    try {

      await axiosClient.post(`/api/user/progress/${roadmapId}/${subtopicId}`);

      await fetchContent();

      if (pageData.nextTopicId) {
        navigate(`/learning/${roadmapId}/${pageData.nextTopicId}`);
      } else {
        toast.success("Roadmap completed! Start your assessment.");
        setTimeout(() => {
          navigate(`/assessment/${roadmapId}`);
        }, 1200);
      }

    } catch (err) {

      if (err.response && err.response.status === 400) {
        alert("🔒 Please complete the previous topics in order first!");
      }

    }

  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  if (!pageData || !pageData.currentSubtopic)
    return <div className="container py-5 text-center">Topic not found.</div>;

  return (

    <div className="bg-light min-vh-100 pb-5">

      {/* HEADER */}

      <div className="bg-white border-bottom py-4 mb-4 shadow-sm">

        <div className="container d-flex justify-content-between align-items-center">

          <div>
            <h2 className="fw-bold mb-0">{pageData.roadmapTitle}</h2>
            <p className="text-muted mb-0">{pageData.currentModule.title}</p>
          </div>

          <div className="text-end" style={{ width: '300px' }}>

            <div className="d-flex justify-content-between mb-1 small fw-bold">
              <span>{pageData.progress.progressPercentage}% completed</span>
            </div>

            <div className="progress" style={{ height: '8px' }}>
              <div className="progress-bar bg-primary" style={{ width: `${pageData.progress.progressPercentage}%` }}></div>
            </div>

          </div>

        </div>

      </div>

      <div className="container">

        <div className="row">

          {/* SIDEBAR */}

          <div className="col-md-3">

            <button className="btn btn-link text-decoration-none text-dark ps-0 mb-3 fw-bold"
              onClick={() => navigate('/my-roadmap')}>
              ← Back to Roadmap
            </button>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

              <div className="list-group list-group-flush">

                {pageData.allSubtopicsOrdered.map((s, index, arr) => {

                  const isCompleted = pageData.completedIds.includes(s.id);
                  const isCurrent = s.id === subtopicId;
                  const isLocked = index > 0 && !pageData.completedIds.includes(arr[index - 1].id) && !isCompleted;

                  return (

                    <div
                      key={s.id}
                      className={`list-group-item p-3 border-0 border-start border-4
                        ${isCurrent ? 'bg-primary bg-opacity-10 border-primary' : 'border-transparent'}
                        ${isLocked ? 'text-muted opacity-50' : 'cursor-pointer'}`}
                      onClick={() => !isLocked && navigate(`/learning/${roadmapId}/${s.id}`)}
                      style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                    >

                      <div className="d-flex align-items-center gap-2">

                        {isCompleted ?
                          <i className="bi bi-check-circle-fill text-success"></i>
                          :
                          isLocked ?
                            <i className="bi bi-lock-fill small"></i>
                            :
                            <span className={isCurrent ? "text-primary" : "text-muted"}>●</span>
                        }

                        <span className={`${isCurrent ? "fw-bold" : ""} small`}>
                          {s.title}
                        </span>

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

          {/* CONTENT AREA */}

          <div className="col-md-9">

            {/* RESOURCES */}

            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">

              <h5 className="fw-bold mb-3">Resources</h5>

              <div className="mb-3">

                <h6 className="text-primary small fw-bold">FREE RESOURCES</h6>

                <ul className="list-unstyled">

                  {pageData.currentTopic?.resources?.free?.length > 0 ?

                    pageData.currentTopic.resources.free.map((r, i) => (
                      <li key={i}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none small">
                          {r.title} ↗
                        </a>
                      </li>
                    ))

                    :

                    <li className="text-muted small">No free resources available</li>

                  }

                </ul>

              </div>

              <div>

                <h6 className="text-primary small fw-bold">PAID RESOURCES</h6>

                <ul className="list-unstyled">

                  {pageData.currentTopic?.resources?.paid?.length > 0 ?

                    pageData.currentTopic.resources.paid.map((r, i) => (
                      <li key={i}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none small">
                          {r.title} ↗
                        </a>
                      </li>
                    ))

                    :

                    <li className="text-muted small">No paid resources available</li>

                  }

                </ul>

              </div>

            </div>

            {/* TOPIC DETAIL */}

            <div className="card border-0 shadow-sm rounded-4 p-4">

              <span className="badge bg-primary bg-opacity-10 text-primary mb-2" style={{ width: 'fit-content' }}>
                TOPIC DETAIL
              </span>

              <h3 className="fw-bold mb-3">{pageData.currentSubtopic.title}</h3>

              <p className="text-secondary mb-4 lead">
                {pageData.currentSubtopic.description}
              </p>

              <div className="bg-dark text-light p-4 rounded-4 mb-5 font-monospace shadow-sm">

                <span className="text-info">
                  // {pageData.currentSubtopic.title} Practice
                </span>

                <br />

                <code>
                  {pageData.currentSubtopic.codeSnippet || `// Coding logic for ${pageData.currentSubtopic.title}`}
                </code>

              </div>

              {/* FOOTER */}

              <div className="d-flex justify-content-between align-items-center border-top pt-4">

                <span className="text-muted small">
                  {pageData.currentStepIndex} / {pageData.totalSteps} Steps
                </span>

                <div className="d-flex gap-2">

                  <button
                    className="btn btn-light text-muted fw-bold px-3"
                    onClick={() => navigate(`/learning/${roadmapId}/${pageData.prevTopicId}`)}
                    disabled={!pageData.prevTopicId}
                  >
                    ‹ Previous
                  </button>

                  <button
                    className={`btn px-4 fw-bold ${pageData.completedIds.includes(subtopicId) ? 'btn-success' : 'btn-primary'}`}
                    onClick={handleMarkComplete}
                  >
                    {pageData.completedIds.includes(subtopicId) ? '✓ Completed' : 'Mark as Complete'}
                  </button>

                  <button
                    className="btn btn-light text-muted fw-bold px-3"
                    onClick={() => navigate(`/learning/${roadmapId}/${pageData.nextTopicId}`)}
                    disabled={!pageData.nextTopicId}
                  >
                    Next ›
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}