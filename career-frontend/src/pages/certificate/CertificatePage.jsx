import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function CertificatePage() {
  const { roadmapId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await axiosClient.get(`/api/user/roadmaps`);
        const roadmap = res.data.find(r => r.roadmapId === Number(roadmapId));
        setCertificate(roadmap);
      } catch (err) {
        console.error("Certificate fetch error:", err);
      }
    };

    fetchCertificate();
  }, [roadmapId]);

  if (!certificate) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        Loading certificate...
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light py-5">
      
      <div
        className="bg-white shadow-lg p-5 position-relative"
        style={{
          width: "900px",
          border: "12px solid #e6c200",
          borderRadius: "12px",
          background: "linear-gradient(180deg,#ffffff,#fafafa)"
        }}
      >

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fw-bold" style={{letterSpacing:"2px"}}>
            CERTIFICATE OF COMPLETION
          </h1>
          <div style={{
            width:"120px",
            height:"3px",
            background:"#e6c200",
            margin:"10px auto"
          }}></div>
        </div>

        {/* Body */}
        <div className="text-center mt-4">

          <p className="text-muted fs-5">
            This certificate is proudly presented to
          </p>

          <h2 className="fw-bold mt-3 mb-4" style={{fontSize:"40px"}}>
            {certificate.username || "PathWiser Learner"}
          </h2>

          <p className="fs-5 text-muted">
            for successfully completing the career roadmap
          </p>

          <h3 className="fw-bold text-primary mt-3 mb-4">
            {certificate.title}
          </h3>

          <p className="text-muted fs-6">
            Completion Date:{" "}
            {certificate.completedAt
              ? new Date(certificate.completedAt).toLocaleDateString()
              : "Recently"}
          </p>

        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between mt-5 px-5">

          <div className="text-center">
            <p className="fw-bold mb-0">PathWiser</p>
            <p className="small text-muted mb-0">Learning Platform</p>
          </div>

          <div className="text-center">
            <p className="fw-bold mb-0">Digitally Verified</p>
            <p className="small text-muted mb-0">PathWiser Certification System</p>
          </div>

        </div>

        {/* Print Button */}
        <div className="text-center mt-5">
          <button
            className="btn btn-dark px-4 rounded-pill"
            onClick={() => window.print()}
          >
            Download / Print Certificate
          </button>
        </div>

      </div>

    </div>
  );
}
