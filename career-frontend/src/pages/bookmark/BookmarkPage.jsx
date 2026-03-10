import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function Bookmarks() {
  const [bookmarkedRoadmaps, setBookmarkedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axiosClient.get('/api/user/bookmarks');
        setBookmarkedRoadmaps(res.data);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  // 2. Logic to delete/remove a bookmark
  const handleRemove = async (roadmapId) => {
    try {
      // Endpoint: DELETE /api/user/bookmarks/{roadmapId}
      await axiosClient.delete(`/api/user/bookmarks/${roadmapId}`);
      
      // Update UI state immediately by filtering out the removed roadmap
      setBookmarkedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
      
      toast.success("Bookmark removed successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to remove bookmark");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5 min-vh-100 bg-white">
      <h2 className="fw-bold mb-4">My Bookmarks</h2>
      <div className="row g-4">
        {bookmarkedRoadmaps.length > 0 ? (
          bookmarkedRoadmaps.map(roadmap => (
            <div className="col-12 col-md-6 col-lg-4" key={roadmap.id}>
              <div className="card h-100 shadow-sm rounded-4 border-light p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-3 fw-bold small">
                    {roadmap.level}
                  </span>
                  {/* TRASH ICON: Triggers the deletion logic */}
                  <button 
                    className="btn btn-link p-0 text-danger" 
                    onClick={() => handleRemove(roadmap.id)}
                    title="Remove Bookmark"
                  >
                    <i className="bi bi-bookmark-fill fs-5"></i>
                  </button>
                </div>
                
                <h4 className="fw-bold text-dark mb-2">{roadmap.title}</h4>
                <p className="text-muted mb-4 small">
                  {roadmap.requiredSkills || "Skills not specified"}
                </p>

                <div className="border-top pt-3 mt-auto">
                   <span className="text-secondary small fw-bold">
                     <i className="bi bi-clock me-2"></i>
                     {roadmap.estimatedDurationMonths} mos
                   </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No bookmarks found. Save some from the Explore page!</p>
          </div>
        )}
      </div>
    </div>
  );
}