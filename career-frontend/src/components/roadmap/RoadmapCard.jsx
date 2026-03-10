import { Link } from "react-router-dom";
import React from 'react';

export default function RoadmapCard({ roadmap }) {
  
  // Soft badge styles perfectly matching your design
  const getBadgeStyle = (level) => {
    const lowerLevel = level?.toLowerCase() || 'beginner';
    if (lowerLevel === "advanced") return "bg-primary bg-opacity-10 text-primary";
    if (lowerLevel === "intermediate") return "bg-warning bg-opacity-10 text-dark";
    return "bg-success bg-opacity-10 text-success";
  };

  // Helper to format skills safely
  const renderSkills = () => {
    if (!roadmap.requiredSkills || roadmap.requiredSkills.length === 0) {
      return "Skills not specified";
    }
    return Array.isArray(roadmap.requiredSkills) 
      ? roadmap.requiredSkills.join(" • ") 
      : roadmap.requiredSkills;
  };

  return (
    <div 
      className="card h-100 border-0 shadow-sm rounded-4 position-relative" 
      style={{ 
        backgroundColor: "#ffffff",
        transition: "transform 0.2s ease, box-shadow 0.2s ease" 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.classList.replace("shadow-sm", "shadow");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.classList.replace("shadow", "shadow-sm");
      }}
    >
      <div className="card-body p-4 d-flex flex-column">
        
        {/* Top Row: Badge & Bookmark */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className={`badge rounded-pill px-3 py-2 fw-semibold ${getBadgeStyle(roadmap.level)}`}>
            {roadmap.level || 'Beginner'}
          </span>
          
          {/* Bookmark Button - Higher z-index so it doesn't trigger the card link! */}
          <button 
            className="btn btn-link p-0 text-secondary opacity-50 border-0 shadow-none position-relative" 
            style={{ zIndex: 2 }}
            onClick={(e) => {
              e.preventDefault(); 
              e.stopPropagation();
              alert("Bookmark clicked! (We will save this in Phase 2)");
            }}
          >
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/>
            </svg>
          </button>
        </div>

        {/* Title with Bootstrap's STRETCHED LINK */}
        <h5 className="card-title fw-bold mb-2 text-dark" style={{ fontSize: "1.25rem", letterSpacing: "-0.5px" }}>
          <Link to={`/roadmap/${roadmap.id}`} className="text-dark text-decoration-none stretched-link">
            {roadmap.title || 'Untitled Roadmap'}
          </Link>
        </h5>

        {/* Required Skills - One Line Preview */}
        <p 
          className="card-text text-secondary mb-0 text-truncate" 
          style={{ fontSize: "0.95rem" }}
          title={renderSkills()} // Native tooltip for truncated text
        >
          {renderSkills()}
        </p>

        {/* Bottom Section: Only Duration */}
        <div className="mt-auto">
          <hr className="text-muted opacity-25 my-3" />
          
          <div className="d-flex align-items-center text-secondary fw-medium" style={{ fontSize: "0.95rem" }}>
            <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            {roadmap.estimatedDurationMonths ? `${roadmap.estimatedDurationMonths} mos` : "N/A"}
          </div>
        </div>

      </div>
    </div>
  );

}
