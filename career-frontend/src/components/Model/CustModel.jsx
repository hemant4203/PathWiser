import React from 'react';

export default function CustomModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" 
         style={{
           position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
           backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1050, backdropFilter: 'blur(4px)'
         }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 text-center animate__animated animate__zoomIn" 
           style={{ maxWidth: '400px', width: '90%', backgroundColor: '#ffffff' }}>
        <div className="mb-3 text-primary">
          <i className="bi bi-info-circle-fill" style={{ fontSize: '3rem' }}></i>
        </div>
        <h4 className="fw-bold mb-2 text-dark">{title || "Action Restricted"}</h4>
        <p className="text-secondary mb-4 small">{message}</p>
        <button 
          className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm"
          style={{ backgroundColor: '#2563eb', border: 'none' }}
          onClick={onClose}
        >
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}