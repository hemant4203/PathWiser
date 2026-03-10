import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoadmaps } from '../../api/roadmapApi';
import { useAuth } from '../../context/useAuth';
import axiosClient from '../../api/axiosClient';

export default function ExplorePage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortType, setSortType] = useState('default');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const loaderRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 1. FIXED: Fetch bookmarks using axiosClient to ensure 401 errors are avoided
  useEffect(() => {
    const fetchInitialBookmarks = async () => {
      if (isAuthenticated) {
        try {
          // Changed to axiosClient for automatic token handling
          const res = await axiosClient.get('/api/user/bookmarks');
          setBookmarkedIds(res.data.map(r => r.id));
        } catch (err) {
          console.error("Error fetching initial bookmarks:", err);
        }
      }
    };
    fetchInitialBookmarks();
  }, [isAuthenticated]);

  // 2. Updated toggle logic (remains consistent with your axiosClient implementation)
  const toggleBookmark = async (e, id) => {
    e.stopPropagation();

    if (!isAuthenticated) { 
      alert("Please log in to save bookmarks.");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(id);

    setBookmarkedIds(prevIds =>
      isBookmarked
        ? prevIds.filter(bookmarkId => bookmarkId !== id)
        : [...prevIds, id]
    );

    try {
      if (isBookmarked) {
        await axiosClient.delete(`/api/user/bookmarks/${id}`);
      } else {
        await axiosClient.post(`/api/user/bookmarks/${id}`);
      }
    } catch (err) {
      console.error("Bookmark Sync Error:", err.response?.status);
      setBookmarkedIds(prevIds =>
        isBookmarked
          ? [...prevIds, id]
          : prevIds.filter(bookmarkId => bookmarkId !== id)
      );
      
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert("Network error: Could not update bookmark.");
      }
    }
  };

  const fetchRoadmaps = async (pageNumber) => {
    try {
      const data = await getAllRoadmaps(pageNumber);
      let actualArray = [];
      if (Array.isArray(data)) actualArray = data;
      else if (data && Array.isArray(data.data)) actualArray = data.data;
      else if (data && Array.isArray(data.content)) actualArray = data.content;

      setRoadmaps(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const filtered = actualArray.filter(r => !existingIds.has(r.id));
        return [...prev, ...filtered];
      });

      if (actualArray.length < 10) setHasMore(false);
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoadmaps(page); }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    }, { threshold: 1 });
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => { if (current) observer.unobserve(current); };
  }, [hasMore]);

  const getSortedRoadmaps = () => {
    let sorted = [...roadmaps];
    const levelWeights = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    switch (sortType) {
      case 'title-asc': return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title-desc': return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'level-asc': return sorted.sort((a, b) => (levelWeights[a.level] || 0) - (levelWeights[b.level] || 0));
      case 'level-desc': return sorted.sort((a, b) => (levelWeights[b.level] || 0) - (levelWeights[a.level] || 0));
      default: return sorted;
    }
  };

  const getBadgeStyle = (level) => {
    const safeLevel = (level || '').toLowerCase();
    if (safeLevel.includes('beginner')) return 'bg-success bg-opacity-10 text-success';
    if (safeLevel.includes('intermediate')) return 'bg-primary bg-opacity-10 text-primary';
    if (safeLevel.includes('advanced')) return 'bg-danger bg-opacity-10 text-danger';
    return 'bg-secondary bg-opacity-10 text-secondary';
  };

  const displayRoadmaps = getSortedRoadmaps();

  return (
    <div className="container py-5 min-vh-100">
      {/* Header and Sorting UI remains exactly the same */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5">
        <div>
          <h1 className="fw-bold text-dark mb-2">Explore Paths</h1>
          <p className="text-muted mb-0">Discover careers tailored to your unique skills through our curated database.</p>
        </div>
        <div className="mt-4 mt-md-0 d-flex align-items-center gap-2">
          <label className="text-muted small fw-medium text-nowrap">Sort by:</label>
          <select className="form-select border-0 bg-light shadow-sm" style={{ minWidth: '200px' }} value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="default">Default / Relevance</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
            <option value="level-asc">Level: Beginner to Advanced</option>
            <option value="level-desc">Level: Advanced to Beginner</option>
          </select>
        </div>
      </div>

      {loading && roadmaps.length === 0 ? (
        <div className="text-center py-5 mt-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4">
          {displayRoadmaps.map(roadmap => (
            <div className="col-12 col-md-6 col-lg-4" key={roadmap.id}>
              <div className="card h-100 shadow-sm rounded-4 text-start" onClick={() => navigate(`/roadmap/${roadmap.id}`)} style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '1px solid #eaeaea' }}>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge px-3 py-2 rounded-3 fw-semibold ${getBadgeStyle(roadmap.level)}`}>{roadmap.level}</span>
                    <i className={`bi ${bookmarkedIds.includes(roadmap.id) ? 'bi-bookmark-fill text-primary' : 'bi-bookmark text-muted opacity-50'} fs-5`} onClick={(e) => toggleBookmark(e, roadmap.id)}></i>
                  </div>
                  <h4 className="card-title fw-bold text-dark mb-2">{roadmap.title}</h4>
                  <p className="text-secondary mb-4">{roadmap.requiredSkills || "Curriculum detailing modules, topics, and practical applications."}</p>
                  <div className="border-top pt-3 mt-auto d-flex justify-content-between align-items-center">
                    <span className="text-secondary fw-medium"><i className="bi bi-clock me-2"></i>{roadmap.estimatedDurationMonths} mos</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div ref={loaderRef} style={{ height: "40px" }}></div>
    </div>
  );
} 