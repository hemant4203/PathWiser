import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/Model/ConfirmModel";

export default function RoadmapManagement() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 7; 
  const navigate = useNavigate();

  // 1. ADD STATE FOR MODAL
  const [archiveTarget, setArchiveTarget] = useState(null);

  const fetchRoadmaps = async (page) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/admin/roadmaps/all?page=${page}&size=${pageSize}`);
      if (res.data && Array.isArray(res.data.content)) {
        const transformedData = res.data.content.map(item => {
          let modulesCount = 0;
          try {
            const parsedStructure = typeof item.structureJson === "string"
                ? JSON.parse(item.structureJson)
                : item.structureJson;

            if (Array.isArray(parsedStructure)) {
              modulesCount = parsedStructure.length;
            }
          } catch (error) {
            console.error("Module parsing failed for roadmap:", item.id, error);
          }

          return {
            id: item.id,
            title: item.title,
            tags: item.highlightTags ? item.highlightTags.split(",") : [],
            modules: modulesCount,
            status: item.deleted ? "Archived" : "Published",
            isDeleted: item.deleted
          };
        });
        setRoadmaps(transformedData);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchRoadmaps(currentPage); }, [currentPage]);

  const handleShuffle = async () => {
    try {
      await axiosClient.post('/api/admin/roadmaps/shuffle');
      toast.success("Explore page order shuffled!");
      fetchRoadmaps(currentPage);
    } catch (err) {
      console.log(err);
      toast.error("Shuffle failed.");
    }
  };

  // 2. UPDATED DELETE LOGIC (Triggers Modal)
  const handleDelete = (id) => {
    setArchiveTarget(id);
  };

  // 3. ACTUAL ARCHIVE EXECUTION
  const executeArchive = async () => {
    if (!archiveTarget) return;
    try {
      await axiosClient.delete(`/api/admin/roadmaps/${archiveTarget}`);
      fetchRoadmaps(currentPage);
      toast.success("Roadmap archived");
    } catch (err) { 
      console.log(err);
      toast.error("Archive failed."); 
    } finally {
      setArchiveTarget(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      await axiosClient.put(`/api/admin/roadmaps/${id}/restore`);
      fetchRoadmaps(currentPage);
      toast.success("Roadmap restored");
    } catch (err) { 
      console.log(err);
      toast.error("Restore failed."); 
    }
  };

  if (loading) return null;

  return (
    <div className="p-4" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f8faff" }}>
      {/* 4. RENDER YOUR CUSTOM MODAL */}
      <ConfirmModal 
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={executeArchive}
        title="Archive Roadmap?"
        message="This will hide the roadmap from users. You can restore it later from the archive settings."
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ fontSize: '24px', color: '#1e293b' }}>Roadmap Management</h3>
          <p className="text-muted mb-0 small">Manage and monitor your learning paths.</p>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 fw-bold"
            style={{ 
              borderRadius: '10px', fontSize: '14px', border: '1px solid #e2e8f0', 
              backgroundColor: 'white', color: '#64748b', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }}
            onClick={handleShuffle}
          >
            <i className="bi bi-shuffle"></i> Shuffle Order
          </button>

          <button 
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-bold" 
            style={{ 
              borderRadius: '10px', backgroundColor: '#3b82f6', border: 'none', fontSize: '14px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)';
            }}
            onClick={() => navigate("/admin/roadmaps/create")}
          >
            <i className="bi bi-plus-lg"></i> Create New Roadmap
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-lg rounded-4 bg-white overflow-hidden mb-auto" style={{ alignSelf: 'flex-start', width: '100%' }}>
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0" style={{ color: '#1e293b', letterSpacing: '0.3px' }}>Roadmap Activity</h6>
          <span className="badge bg-light text-muted border fw-medium" style={{ fontSize: '10px' }}>{totalElements} Total</span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr style={{ fontSize: '11px', letterSpacing: '1px', color: '#64748b' }}>
                <th className="ps-4 py-3 fw-bold text-uppercase">ID</th>
                <th className="py-3 fw-bold text-uppercase">Title</th>
                <th className="py-3 fw-bold text-uppercase text-center">Tags</th>
                <th className="py-3 fw-bold text-uppercase text-center">Modules</th>
                <th className="py-3 fw-bold text-uppercase text-center">Status</th>
                <th className="text-end pe-4 py-3 fw-bold text-uppercase">Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {roadmaps.map((roadmap) => (
                <tr 
                  key={roadmap.id} 
                  className="border-bottom" 
                  style={{ 
                    borderColor: '#f1f5f9', transition: 'all 0.25s ease', cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f950';
                    e.currentTarget.style.transform = 'scale(1.002)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <td className="ps-4 text-muted" style={{ fontSize: '12px', width: '80px' }}>#{roadmap.id}</td>
                  <td className="py-3" style={{ minWidth: '220px' }}>
                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{roadmap.title}</div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-wrap gap-1">
                      {roadmap.tags.map((tag, idx) => (
                        <span key={idx} className="badge rounded-pill border-0 px-2 py-1 fw-bold" 
                              style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '10px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="fw-bold px-2 py-1 rounded-2 bg-light text-secondary" style={{ fontSize: '12px' }}>
                      {roadmap.modules}
                    </span>
                  </td>
                  <td className="text-center">
                      <span className="badge rounded-pill px-3 py-1 fw-bold" 
                            style={{ 
                              backgroundColor: roadmap.status === 'Published' ? '#dcfce7' : '#f1f5f9', 
                              color: roadmap.status === 'Published' ? '#16a34a' : '#64748b',
                              fontSize: '10px',
                              border: `1px solid ${roadmap.status === 'Published' ? '#bbf7d0' : '#e2e8f0'}`
                            }}>
                        {roadmap.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2 align-items-center">
                        <button 
                          className="btn btn-sm fw-bold border-0 px-3" 
                          style={{ 
                            borderRadius: '8px', fontSize: '12px', backgroundColor: '#eff6ff', 
                            color: '#2563eb', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                            e.target.style.color = '#fff';
                            e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.25)';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#eff6ff';
                            e.target.style.color = '#2563eb';
                            e.target.style.boxShadow = 'none';
                            e.target.style.transform = 'translateY(0)';
                          }}
                          onClick={() => navigate(`/admin/roadmaps/edit/${roadmap.id}`)}
                        >
                          Edit
                        </button>
                        
                        {roadmap.isDeleted ? (
                          <button 
                            className="btn btn-sm p-2 text-success border-0 bg-transparent"
                            style={{ transition: 'all 0.3s ease', opacity: '0.6', borderRadius: '8px' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.transform = 'rotate(-15deg) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                            }}
                            onClick={() => handleRestore(roadmap.id)} 
                            title="Restore"
                          >
                            <i className="bi bi-arrow-counterclockwise fs-5"></i>
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm p-2 text-danger border-0 bg-transparent"
                            style={{ transition: 'all 0.3s ease', opacity: '0.4', borderRadius: '8px' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.transform = 'translateY(-1px) scale(1.1)';
                              e.currentTarget.querySelector('i').className = 'bi bi-trash3-fill fs-6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.4';
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'currentColor';
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.querySelector('i').className = 'bi bi-trash3 fs-6';
                            }}
                            onClick={() => handleDelete(roadmap.id)} 
                            title="Archive"
                          >
                            <i className="bi bi-trash3 fs-6"></i>
                          </button>
                        )}
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-top d-flex justify-content-between align-items-center bg-white">
          <small className="text-muted fw-bold" style={{ fontSize: '12px' }}>
            Displaying {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
          </small>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-sm btn-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
              disabled={currentPage === 0}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="px-3 py-1 bg-primary text-white rounded-pill fw-bold shadow-sm" style={{ fontSize: '12px' }}>
              {currentPage + 1}
            </div>

            <button 
              className="btn btn-sm btn-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
              disabled={currentPage >= totalPages - 1}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}