import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function AssessmentPage() {

  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);

  const [githubLink, setGithubLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [liveLink, setLiveLink] = useState("");

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {

    const fetchAssessment = async () => {

      try {

        const res = await axiosClient.get(`/api/assessment/${roadmapId}`);

        setAssessment(res.data);

      } catch (err) {

        console.error("Failed to load assessment", err);

        toast.error("Failed to load assessment");

      }

    };

    fetchAssessment();

  }, [roadmapId]);


  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {

    if (submitting) return; // prevents double click

    if (assessment?.requiresGithub && !githubLink) {
      toast.error("GitHub link is required.");
      return;
    }

    if (assessment?.requiresLiveLink && !liveLink) {
      toast.error("Live deployment link is required.");
      return;
    }

    if (assessment?.requiresVideoLink && !videoLink) {
      toast.error("Video demo link is required.");
      return;
    }

    if (
      (githubLink && !isValidUrl(githubLink)) ||
      (videoLink && !isValidUrl(videoLink)) ||
      (liveLink && !isValidUrl(liveLink))
    ) {
      toast.error("Please enter valid URLs (starting with http:// or https://).");
      return;
    }

    try {

      setSubmitting(true); // lock submit button
      setLoading(true);

      await axiosClient.post(`/api/assessment/${roadmapId}/submit`, {
        githubLink,
        videoLink,
        liveLink
      });

      toast.success("Assessment submitted successfully!");

      navigate("/my-roadmap");

    } catch (err) {

      console.error("Assessment Error:", err);

      toast.error(
        err.response?.data?.message || "Failed to submit assessment. Please try again."
      );

    } finally {

      setLoading(false);
      setSubmitting(false);

    }

  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-5">
                <div className="row g-5">

                  {/* LEFT SECTION */}
                  <div className="col-md-5 border-end d-flex flex-column justify-content-center">
                    <div>
                      <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2 rounded-pill fw-bold">
                        FINAL PROJECT
                      </span>
                      <h2 className="fw-bold mb-3">
                        Automated Testing Framework
                      </h2>
                      <p className="text-muted mb-4">
                        Develop a real-world automated testing framework for a
                        web application. This project demonstrates your
                        understanding of automation design, testing strategy,
                        and framework architecture.
                      </p>
                      <div className="bg-light rounded-3 p-4 small border">
                        <div className="fw-bold mb-2">
                          Expected Deliverables
                        </div>
                        <ul className="mb-0 text-muted">
                          <li className="mb-1">Structured automation framework</li>
                          <li className="mb-1">Sample automated test cases</li>
                          <li className="mb-1">Clean GitHub repository</li>
                          <li>Video explanation of your work</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="col-md-7 d-flex flex-column justify-content-center">

                    <h5 className="fw-bold mb-4">
                      Submit Your Project
                    </h5>

                    {assessment?.requiresGithub && (
                      <div className="mb-4">
                        <label className="form-label fw-semibold text-dark">
                          GitHub Repository URL
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-lg bg-light"
                          placeholder="https://github.com/username/project"
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {assessment?.requiresVideoLink && (
                      <div className="mb-5">
                        <label className="form-label fw-semibold text-dark">
                          Video Demo URL
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-lg bg-light"
                          placeholder="https://youtube.com/demo"
                          value={videoLink}
                          onChange={(e) => setVideoLink(e.target.value)}
                          disabled={loading}
                        />
                        <div className="form-text mt-2">
                          Ensure your video link is accessible (unlisted or public).
                        </div>
                      </div>
                    )}

                    {assessment?.requiresLiveLink && (
                      <div className="mb-5">
                        <label className="form-label fw-semibold text-dark">
                          Live Deployment URL
                        </label>
                        <input
                          type="url"
                          className="form-control form-control-lg bg-light"
                          placeholder="https://your-app.vercel.app"
                          value={liveLink}
                          onChange={(e) => setLiveLink(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-100 py-3 fw-bold rounded-pill d-flex justify-content-center align-items-center gap-2"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Assessment"
                      )}
                    </button>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}