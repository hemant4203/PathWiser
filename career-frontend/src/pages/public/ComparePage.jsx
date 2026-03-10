import { React, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { compareRoadmaps } from "../../api/roadmapApi";

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const id1 = searchParams.get("id1");
  const id2 = searchParams.get("id2");

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id1 || !id2) {
      setError("Two roadmap IDs are required for comparison.");
      setLoading(false);
      return;
    }

    const loadComparison = async () => {
      try {
        const response = await compareRoadmaps(id1, id2);
        // Assuming the backend returns an array of two roadmap objects for comparison
        setComparison(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load comparison data.");
      } finally {
        setLoading(false);
      }
    };
    loadComparison();
  }, [id1, id2]);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!comparison || comparison.length < 2) return <div className="alert alert-warning">Incomplete comparison data.</div>;

  const [rm1, rm2] = comparison;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Compare Roadmaps</h2>
        <Link to="/" className="btn btn-outline-secondary">&larr; Back to Explore</Link>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-striped bg-white mb-0">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "20%" }}>Feature</th>
              <th style={{ width: "40%" }}>{rm1.title}</th>
              <th style={{ width: "40%" }}>{rm2.title}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Level</strong></td>
              <td>{rm1.level}</td>
              <td>{rm2.level}</td>
            </tr>
            <tr>
              <td><strong>Duration</strong></td>
              <td>{rm1.estimatedDurationMonths} months</td>
              <td>{rm2.estimatedDurationMonths} months</td>
            </tr>
            <tr>
              <td><strong>Salary Range</strong></td>
              <td>{rm1.salaryRange}</td>
              <td>{rm2.salaryRange}</td>
            </tr>
            <tr>
              <td><strong>Required Skills</strong></td>
              <td>{rm1.requiredSkills?.join(", ")}</td>
              <td>{rm2.requiredSkills?.join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Highlight Tags</strong></td>
              <td>{rm1.highlightTags?.join(", ")}</td>
              <td>{rm2.highlightTags?.join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Modules</strong></td>
              <td>{rm1.structureJson?.modules?.length || 0} Modules</td>
              <td>{rm2.structureJson?.modules?.length || 0} Modules</td>
            </tr>
            <tr>
              <td><strong>Core Topics</strong></td>
              <td>
                <ul className="mb-0 ps-3">
                  {rm1.structureJson?.modules?.slice(0, 3).map((m, i) => (
                    <li key={i}>{m.title}</li>
                  ))}
                  {rm1.structureJson?.modules?.length > 3 && <li><em>...and more</em></li>}
                </ul>
              </td>
              <td>
                <ul className="mb-0 ps-3">
                  {rm2.structureJson?.modules?.slice(0, 3).map((m, i) => (
                    <li key={i}>{m.title}</li>
                  ))}
                  {rm2.structureJson?.modules?.length > 3 && <li><em>...and more</em></li>}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

}

