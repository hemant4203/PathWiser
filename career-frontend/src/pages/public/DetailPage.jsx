import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient"; 
import { useParams, useNavigate } from "react-router-dom";
import { fetchRoadmapDetail } from "../../api/roadmapApi";
import StructuredRoadmap from "../../components/roadmap/StructuredRoadmap";
import { useAuth } from "../../context/useAuth"; 
import "./DetailPage.css";

// 1. ADDED: Simple Modal Component for Centered Alert
const CustomAlertModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" 
         style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 text-center animate__animated animate__fadeInUp" 
           style={{ maxWidth: '420px', width: '90%', backgroundColor: '#ffffff' }}>
        <div className="mb-3 text-primary">
          <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '3.5rem' }}></i>
        </div>
        <h4 className="fw-bold mb-2 text-dark">Active Roadmap Found</h4>
        <p className="text-secondary mb-4 small px-2">{message}</p>
        <button className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" style={{ backgroundColor: '#2563eb', border: 'none' }} onClick={onClose}>
          Got it, thanks!
        </button>
      </div>
    </div>
  );
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // 2. ADDED: Modal State
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "" });

  useEffect(() => {
    let isMounted = true; 
    const loadDetail = async () => {
      try {
        const response = await fetchRoadmapDetail(id);
        if (isMounted) setRoadmap(response.data);
      } catch (err) { 
        console.error("Failed to load roadmap details:", err); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    };
    loadDetail();
    return () => { isMounted = false; };
  }, [id]);

  const getHighlightTags = () => {
    if (!roadmap?.highlightTags) return [];
    return Array.isArray(roadmap.highlightTags) ? roadmap.highlightTags : roadmap.highlightTags.split(',');
  };

  const getModules = () => {
    if (!roadmap?.structureJson) return [];
    let data = roadmap.structureJson;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return []; }
    }
    return Array.isArray(data) ? data : (data.modules || []);
  };

  const handleNodeClick = (nodeData, type) => {
    setSelectedNode({ 
      title: typeof nodeData === 'string' ? nodeData : nodeData.title,
      type: type,
      description: nodeData.description || `Overview for this ${type}.`
    });
    setIsDrawerOpen(true);
  };

  const formatSalary = (value) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return "0";
    if (num >= 10000000) return `${(num / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1).replace(/\.0$/, '')} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')} K`;
    return num.toLocaleString('en-IN');
  };

  const handleStartRoadmap = async () => {
    try {
      const token = localStorage.getItem('accessToken'); 
      if (!token) {
        setAlertModal({ isOpen: true, message: "Please login to start your learning journey!" });
        return;
      }
      await axiosClient.post(`/api/user/roadmaps/${id}/start`);
      navigate('/my-roadmap');
    } catch (err) {
      if (err.response?.status === 409) {
        // 3. UPDATED: Open Modal instead of browser alert
        setAlertModal({ 
          isOpen: true, 
          message: "You already have an active roadmap! Please complete your current journey before starting a new one." 
        });
      } else {
        console.error("Error starting roadmap:", err.response?.status);
      }
    }
  };

  const handleCloseAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false });
    // Redirect if they were blocked due to an active roadmap
    if (alertModal.message.includes("active roadmap")) {
      navigate('/my-roadmap');
    }
  };

  if (loading) return <div className="text-center mt-5 pt-5"><div className="spinner-border text-primary" role="status"></div></div>;
  if (!roadmap) return <div className="text-center mt-5 pt-5"><h3 className="text-muted">Roadmap not found.</h3><button onClick={() => navigate('/explore')} className="btn btn-primary mt-3">Back to Explore</button></div>;

  return (
    <div className="detail-page-wrapper bg-light min-vh-100 pb-5">
      {/* 4. ADDED: Render the Custom Alert */}
      <CustomAlertModal 
        isOpen={alertModal.isOpen} 
        onClose={handleCloseAlert} 
        message={alertModal.message} 
      />

      <div className="container py-5">
        <div className="card border-0 shadow-sm rounded-4 p-4 p-lg-5 mb-5 bg-white">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 fw-bold">{roadmap.level}</span>
              <h1 className="display-5 fw-bold mb-3 text-dark">{roadmap.title}</h1>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {getHighlightTags().map((tag, i) => (
                  <span key={i} className="badge bg-light text-secondary border px-2 py-1">{tag}</span>
                ))}
              </div>
              <button onClick={handleStartRoadmap} className="btn btn-primary btn-md px-4 rounded-pill fw-bold shadow-sm">
                {isAuthenticated ? "Start Roadmap" : "Login to Start"}
              </button>
            </div>
            <div className="col-lg-5 mt-4 mt-lg-0 text-lg-end">
              <div className="d-inline-flex gap-3">
                <div className="p-3 rounded-4 bg-light text-start border border-light">
                  <div className="text-muted small fw-bold mb-1 text-uppercase">Duration</div>
                  <div className="h4 fw-bold mb-0 text-dark">{roadmap.estimatedDurationMonths} Mon</div>
                </div>
                <div className="p-3 rounded-4 bg-light text-start border border-light">
                  <div className="text-muted small fw-bold mb-1 text-uppercase">Salary Range</div>
                  <div className="h6 fw-bold mb-0 text-success">₹{formatSalary(roadmap.salaryMin)} - ₹{formatSalary(roadmap.salaryMax)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 border-0">
          <StructuredRoadmap data={getModules()} onNodeClick={handleNodeClick} />
        </div>
      </div>

      {isDrawerOpen && (
        <div className="drawer-overlay-system position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050 }}>
          <div className="drawer-backdrop bg-dark bg-opacity-50 w-100 h-100 position-absolute" onClick={() => setIsDrawerOpen(false)}></div>
          <aside className="vertical-half-drawer bg-white shadow-lg position-absolute top-0 end-0 h-100" style={{ width: '50vw', maxWidth: '100vw', transition: 'transform 0.3s ease' }}>
            <div className="p-4 p-lg-5">
              <button className="btn-close mb-4" onClick={() => setIsDrawerOpen(false)}></button>
              <h3 className="fw-bold mb-4 text-dark">{selectedNode?.title}</h3>
              <hr /><p className="text-secondary fs-6 lh-lg mt-4">{selectedNode?.description}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}