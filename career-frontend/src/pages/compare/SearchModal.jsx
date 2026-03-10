import React, { useState, useEffect } from 'react';
import { getAllRoadmaps } from '../../api/roadmapApi';

export default function SearchModal({ isOpen, onClose, onSelect, existingPaths = [] }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      getAllRoadmaps()
        .then(data => {
          if (isMounted) {
            let actualArray = [];
            if (Array.isArray(data)) actualArray = data;
            else if (data && Array.isArray(data.data)) actualArray = data.data;
            else if (data && Array.isArray(data.content)) actualArray = data.content;
            setRoadmaps(actualArray);
          }
        })
        .catch(err => console.error(err));
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  const safeExisting = Array.isArray(existingPaths) ? existingPaths : [];
  const safeRoadmaps = Array.isArray(roadmaps) ? roadmaps : [];

  const displayRoadmaps = safeRoadmaps.filter(roadmap => {
    if (!roadmap) return false; 
    const primaryKey = String(roadmap.id || roadmap.roadmapId || roadmap.pathId); 
    
    const matchesSearch = roadmap.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isSelected = safeExisting.some(ep => {
      const epKey = String(ep?.id || ep?.roadmapId || ep?.pathId);
      return epKey && epKey === primaryKey;
    });
    
    return matchesSearch && !isSelected;
  });

  return (
    <>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={handleClose}>
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
          <div className="modal-content border-0 shadow-lg rounded-4">
            
            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
              <h5 className="modal-title fw-bold text-dark">Select Career Path</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            
            <div className="modal-body px-4 pb-2 pt-3">
              <div className="input-group shadow-sm rounded-3 overflow-hidden">
                <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control border-0 bg-light py-2" 
                  placeholder="Search roadmaps..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="modal-body px-4 pt-2 pb-4" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {displayRoadmaps.length > 0 ? (
                <div className="list-group list-group-flush border rounded-3 overflow-hidden shadow-sm">
                  {displayRoadmaps.map(roadmap => (
                    <button 
                      key={roadmap.id} 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-bottom"
                      onClick={() => {
                        setSearchTerm('');
                        onSelect(roadmap);
                        onClose();
                      }}
                    >
                      <div className="text-start pe-3">
                        <div className="fw-bold text-dark mb-1">{roadmap.title}</div>
                        {/* Modules and Months side-by-side! */}
                        <div className="small text-muted mt-1">
                          <i className="bi bi-clock me-1"></i>est-duration {roadmap.estimatedDurationMonths || 0} Months
                        </div>
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                        {roadmap.level}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted my-5 py-4 bg-light rounded-3">
                  <i className="bi bi-inbox fs-2 text-secondary mb-2 d-block"></i>
                  No available roadmaps found.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}