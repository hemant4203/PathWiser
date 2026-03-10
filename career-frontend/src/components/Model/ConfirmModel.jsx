import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" 
         style={{
           position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
           backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 2000, backdropFilter: 'blur(3px)'
         }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 text-center animate__animated animate__zoomIn" 
           style={{ maxWidth: '380px', width: '90%', backgroundColor: '#ffffff' }}>
        <div className="mb-3">
          <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center" 
               style={{ width: '60px', height: '60px' }}>
            <i className="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
          </div>
        </div>
        <h5 className="fw-bold mb-2 text-dark">{title}</h5>
        <p className="text-secondary mb-4 small">{message}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-light w-100 py-2 fw-bold rounded-3 text-secondary" 
                  onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger w-100 py-2 fw-bold rounded-3 shadow-sm"
                  onClick={() => { onConfirm(); onClose(); }}>
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}