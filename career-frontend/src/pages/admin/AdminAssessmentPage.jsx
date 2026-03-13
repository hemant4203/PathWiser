import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminAssessments() {

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  const fetchSubmissions = async () => {
    try {
      const res = await axiosClient.get("/api/admin/assessments/pending");

      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );

      setSubmissions(sorted);

    } catch (err) {
      console.error("Failed to fetch submissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const approveSubmission = async (id) => {
    try {

      await axiosClient.post(`/api/admin/assessments/${id}/approve`);

      setSubmissions(prev => prev.filter(s => s.id !== id));

    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve submission");
    }
  };

  const openRejectModal = (id) => {
  setRejectId(id);
  };

  const submitReject = async () => {

    if (!rejectComment.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    try {

      await axiosClient.post(`/api/admin/assessments/${rejectId}/reject`, {
        comment: rejectComment
      });

      setRejectId(null);
      setRejectComment("");

      await fetchSubmissions();

    } catch (err) {

      console.error("Rejection failed", err);
      alert("Failed to reject submission");

    }
  };

  if (loading) {
    return <div className="p-4">Loading submissions...</div>;
  }

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Assessment Reviews</h3>
        <span className="badge bg-primary">
          {submissions.length} Pending
        </span>
      </div>

      {submissions.length === 0 && (
        <div className="alert alert-success">
          No assessments pending review.
        </div>
      )}

      <div className="row g-4">

        {submissions.map((submission) => (
          <div key={submission.id} className="col-md-6 col-lg-4">

            <div className="card shadow-sm border-0 rounded-4 h-100">

              {/* Header */}
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">

                <span className="badge bg-warning text-dark">
                  Pending Review
                </span>

                {submission.submittedAt && (
                  <small className="text-muted">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </small>
                )}

              </div>

              {/* Body */}
              <div className="card-body">

                <h5 className="fw-bold mb-2">
                  {submission.roadmapTitle}
                </h5>

                <p className="text-muted small mb-3">
                  Submitted by <strong>{submission.username}</strong>
                </p>

                <div className="small">

                  {submission.githubLink && (
                    <div className="mb-2">
                      <strong>GitHub:</strong>{" "}
                      <a
                        href={submission.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        View Repository
                      </a>
                    </div>
                  )}

                  {submission.liveLink && (
                    <div className="mb-2">
                      <strong>Live Demo:</strong>{" "}
                      <a
                        href={submission.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        Open Project
                      </a>
                    </div>
                  )}

                  {submission.videoLink && (
                    <div className="mb-2">
                      <strong>Video Demo:</strong>{" "}
                      <a
                        href={submission.videoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        Watch Video
                      </a>
                    </div>
                  )}

                </div>

              </div>

              {/* Footer */}
              <div className="card-footer bg-white border-0 d-flex gap-2">

                <button
                  className="btn btn-outline-danger flex-fill"
                  onClick={() => openRejectModal(submission.id)}
                >
                  Reject
                </button>

                <button
                  className="btn btn-success flex-fill"
                  onClick={() => approveSubmission(submission.id)}
                >
                  Approve
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {rejectId && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">

              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Reject Submission</h5>
                <button
                  className="btn-close"
                  onClick={() => setRejectId(null)}
                />
              </div>

              <div className="modal-body">

                <label className="form-label fw-semibold">
                  Reason for rejection
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Explain why the submission was rejected..."
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />

              </div>

              <div className="modal-footer border-0">

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setRejectId(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={submitReject}
                >
                  Reject Submission
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}