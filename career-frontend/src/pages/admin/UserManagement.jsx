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
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    /* REMOVED vh-100 and overflow-hidden.
       The container now only grows as large as the table.
    */
    <div className="container-fluid bg-light px-4 py-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ fontSize: '22px' }}>User Management</h3>
        <p className="text-muted mb-0 small">Manage and monitor platform usernames.</p>
      </div>

      <div className="mb-4">
        <div className="input-group shadow-sm rounded-3 overflow-hidden border-0" style={{ maxWidth: "400px" }}>
          <span className="input-group-text bg-white border-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 py-2 shadow-none"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* REMOVED h-100 and flex-grow-1.
          The card will now wrap tightly around your 7 rows.
      */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-0">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="fw-bold mb-0">User Activity</h6>
        </div>

        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                <th className="ps-4 py-3">ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-bottom-0">
                  <td className="ps-4 text-muted small">#{user.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                        <i className="bi bi-person text-secondary small"></i>
                      </div>
                      <span className="fw-semibold small">{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border px-3 py-1 fw-medium" style={{ fontSize: '10px' }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: user.enabled ? '#10b981' : '#ef4444' }}></div>
                      <span className="small fw-medium" style={{ color: user.enabled ? '#10b981' : '#ef4444' }}>
                        {user.enabled ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="text-muted small">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="text-end pe-4">
                    <button 
                      className={`btn btn-sm fw-bold px-3 border-0 ${user.enabled ? 'text-danger bg-danger-subtle' : 'text-success bg-success-subtle'}`}
                      style={{ fontSize: '11px', borderRadius: '6px' }}
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

        <div className="p-3 border-top d-flex justify-content-between align-items-center bg-white">
          <small className="text-muted ms-2" style={{ fontSize: '12px' }}>
            Showing {filteredUsers.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </small>
          <div className="d-flex align-items-center gap-1 me-2">
            <button className="btn btn-sm btn-light border-0 bg-transparent text-muted px-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="btn btn-sm btn-primary rounded-2 px-3 fw-bold" style={{ fontSize: '11px', height: '28px' }}>{currentPage}</button>
            <button className="btn btn-sm btn-light border-0 bg-transparent text-muted px-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}