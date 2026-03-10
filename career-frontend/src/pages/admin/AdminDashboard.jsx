import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRoadmaps: 0,
    totalEnrollments: 0,
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 1. REUSABLE FETCH FUNCTION (Logic remains exactly the same)
  const fetchDashboardData = useCallback(async (isAutoRefresh = false) => {
    try {
      const res = await axiosClient.get("/api/admin/stats");
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err.response?.status);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, []);

  // 2. INITIAL FETCH AND DATA AUTO-REFRESH (Every 30 seconds)
  useEffect(() => {
    fetchDashboardData();

    // Re-fetches data every 30 seconds to keep UI live
    const dataInterval = setInterval(() => fetchDashboardData(true), 30000);

    return () => clearInterval(dataInterval);
  }, [fetchDashboardData]);

  // AUTO REFRESH TOKEN KEEP-ALIVE (Your original logic preserved)
  useEffect(() => {
    const keepSessionAlive = async () => {
      try {
        await axiosClient.get("/api/admin/stats");
      } catch (err) {
        console.log(err);
        console.error("Session keep-alive failed");
      }
    };

    const interval = setInterval(keepSessionAlive, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = stats.recentActivity.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(stats.recentActivity.length / rowsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light py-4 px-4">

      {/* PAGE HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Dashboard</h3>
        <p className="text-muted mb-0">
          Welcome back, Admin. Here is a summary of platform activity.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", background: "#eef2ff" }}
              >
                <i className="bi bi-people text-primary fs-5"></i>
              </div>

              <div>
                <div className="text-muted small">Total Users</div>
                <h4 className="fw-bold mb-0">{stats.totalUsers}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", background: "#ecfdf5" }}
              >
                <i className="bi bi-person-check text-success fs-5"></i>
              </div>

              <div>
                <div className="text-muted small">Active Users</div>
                <h4 className="fw-bold mb-0">{stats.totalEnrollments}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", background: "#fffbeb" }}
              >
                <i className="bi bi-journal-bookmark text-warning fs-5"></i>
              </div>

              <div>
                <div className="text-muted small">Total Roadmaps</div>
                <h4 className="fw-bold mb-0">{stats.activeRoadmaps}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", background: "#ecfeff" }}
              >
                <i className="bi bi-check-circle text-info fs-5"></i>
              </div>

              <div>
                <div className="text-muted small">Avg. Completion</div>
                <h4 className="fw-bold mb-0">64%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold mb-0">Recent Activity</h5>
        </div>

        <div className="table-responsive">
          <table className="table align-middle table-hover mb-0">

            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">User Name</th>
                <th>Action</th>
                <th>Roadmap</th>
                <th>Date</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((item, i) => (
                  <tr key={i}>

                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                          style={{ width: "36px", height: "36px" }}
                        >
                          <i className="bi bi-person text-secondary"></i>
                        </div>

                        <span className="fw-semibold">{item.username}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                        Completed
                      </span>
                    </td>

                    <td className="text-muted">{item.roadmapTitle}</td>

                    <td className="text-muted">
                      {new Date(item.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-light border-0">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">

          <small className="text-muted">
            Showing {indexOfFirstRow + 1} to{" "}
            {Math.min(indexOfLastRow, stats.recentActivity.length)} of{" "}
            {stats.recentActivity.length} logs
          </small>

          <div className="d-flex align-items-center gap-2">

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <button className="btn btn-sm btn-primary px-3">
              {currentPage}
            </button>

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            >
              <i className="bi bi-chevron-right"></i>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}