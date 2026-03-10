import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7; 

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/api/admin/users");
      if (res.data && Array.isArray(res.data.content)) {
        setUsers(res.data.content);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const endpoint = user.enabled 
      ? `/api/admin/users/${user.id}/suspend` 
      : `/api/admin/users/${user.id}/activate`;
    try {
      const res = await axiosClient.patch(endpoint);
      if (res.status === 200) {
        setUsers(prevUsers => 
          prevUsers.map(u => u.id === user.id ? { ...u, enabled: !user.enabled } : u)
        );
      }
    } catch (err) {
      console.error("PATCH Error:", err.response?.data?.message || "Error");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light px-4 py-4 min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ fontSize: '24px', color: '#1e293b' }}>User Management</h3>
        <p className="text-muted mb-0 small">Audit and manage platform access for all active users.</p>
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <div className="input-group shadow-sm rounded-4 overflow-hidden border" style={{ maxWidth: "420px", border: '1px solid #e2e8f0' }}>
          <span className="input-group-text bg-white border-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 py-2 shadow-none"
            placeholder="Search by username..."
            value={searchTerm}
            style={{ fontSize: '14px' }}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-lg rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0" style={{ color: '#334155' }}>User Activity</h6>
          <span className="badge bg-light text-secondary border fw-medium" style={{ fontSize: '10px' }}>
            {filteredUsers.length} total users
          </span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr style={{ fontSize: '11px', letterSpacing: '0.8px', backgroundColor: '#f8fafc' }}>
                <th className="ps-4 py-3">ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {currentUsers.map((user) => (
                <tr 
                  key={user.id} 
                  style={{ 
                    transition: 'all 0.2s ease', 
                    cursor: 'default',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.transform = 'scale(1.002)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <td className="ps-4 text-muted small">#{user.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                           style={{ width: "36px", height: "36px", backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}>
                        <i className="bi bi-person-fill text-primary" style={{ fontSize: '18px' }}></i>
                      </div>
                      <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge rounded-pill bg-light text-primary border px-3 py-1 fw-bold" style={{ fontSize: '10px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle shadow-sm" 
                           style={{ 
                             width: '10px', height: '10px', 
                             backgroundColor: user.enabled ? '#10b981' : '#ef4444',
                             boxShadow: `0 0 8px ${user.enabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}` 
                           }}></div>
                      <span className="small fw-bold" style={{ color: user.enabled ? '#059669' : '#dc2626' }}>
                        {user.enabled ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted small fw-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="text-end pe-4">
                    <button 
                      className={`btn btn-sm fw-bold px-4 border-0 shadow-sm transition-all`}
                      style={{ 
                        fontSize: '11px', 
                        borderRadius: '8px',
                        backgroundColor: user.enabled ? '#fef2f2' : '#f0fdf4',
                        color: user.enabled ? '#dc2626' : '#16a34a',
                        transition: '0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = user.enabled ? '#dc2626' : '#16a34a';
                        e.target.style.color = '#fff';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = user.enabled ? '#fef2f2' : '#f0fdf4';
                        e.target.style.color = user.enabled ? '#dc2626' : '#16a34a';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.enabled ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-4 border-top d-flex justify-content-between align-items-center bg-white">
          <small className="text-muted fw-bold" style={{ fontSize: '12px' }}>
            Showing {filteredUsers.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
          </small>
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-sm btn-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            <div className="px-3 py-1 bg-primary text-white rounded-pill fw-bold shadow-sm" style={{ fontSize: '12px' }}>
              {currentPage}
            </div>

            <button 
              className="btn btn-sm btn-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}