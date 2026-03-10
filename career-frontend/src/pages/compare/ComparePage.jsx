import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { compareRoadmaps } from '../../api/roadmapApi'; 
import SearchModal from './SearchModal';

export default function ComparePage() {
  const { id1, id2 } = useParams();
  const navigate = useNavigate();

  const [selectedPaths, setSelectedPaths] = useState([null, null]); 
  const [comparisonData, setComparisonData] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id1 && id2) {
      handleAutoCompare(id1, id2);
    }
  }, [id1, id2, navigate]);

  const handleAutoCompare = async (firstId, secondId) => {
    setIsLoading(true);
    try {
      const res = await compareRoadmaps(firstId, secondId);
      setComparisonData(res.data);
      setSelectedPaths([res.data.first, res.data.second]);
    } catch (error) {
      console.error("Auto-comparison failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (path) => {
    const newPaths = [...selectedPaths];
    newPaths[activeSlot] = path;
    setSelectedPaths(newPaths);
    setComparisonData(null); 
    if (id1 || id2) navigate('/compare'); 
    setIsModalOpen(false);
  };

  const handleCompareClick = async () => {
    if (selectedPaths[0] && selectedPaths[1]) {
      setIsLoading(true);
      try {
        const res = await compareRoadmaps(selectedPaths[0].id, selectedPaths[1].id);
        setComparisonData(res.data); 
        navigate(`/compare?id1=${selectedPaths[0].id}&id2=${selectedPaths[1].id}`, { replace: true });
      } catch (error) {
        console.error("Comparison failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTags = (tags) => {
    if (!tags) return [];
    return Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim());
  };

  const formatSalary = (value) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return "N/A";
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const renderRow = (label, field) => (
    <tr>
      <td className="p-4 text-secondary small fw-bold text-uppercase">{label}</td>
      <td className="p-4 fw-medium text-dark">{comparisonData.first[field] ?? 'N/A'}</td>
      <td className="p-4 fw-medium text-dark">{comparisonData.second[field] ?? 'N/A'}</td>
    </tr>
  );

  return (
    <div className="container py-5 bg-white min-vh-100">
      <h1 className="fw-bold mb-2">Compare Paths</h1>
      <p className="text-muted mb-5">Analyze career metrics side-by-side.</p>
      
      <div className="card border-0 shadow-sm p-4 mb-5 rounded-4 bg-light">
        <div className="row g-3 align-items-end">
          {[0, 1].map((i) => (
            <div key={i} className="col-md-4">
              <label className="small fw-bold text-muted mb-2 text-uppercase">Path {i + 1}</label>
              <div 
                className="form-select bg-white border-0 py-2 px-3 rounded-3 shadow-sm d-flex align-items-center"
                onClick={() => { setActiveSlot(i); setIsModalOpen(true); }}
                style={{ cursor: 'pointer', minHeight: '45px' }}
              >
                <span className={selectedPaths[i] ? "text-dark fw-bold" : "text-muted"}>
                  {selectedPaths[i] ? selectedPaths[i].title : "Select Roadmap..."}
                </span>
              </div>
            </div>
          ))}
          <div className="col-md-4">
            <button 
              className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" 
              style={{ backgroundColor: '#1E3A8A', border: 'none' }}
              onClick={handleCompareClick}
              disabled={!selectedPaths[0] || !selectedPaths[1] || isLoading}
            >
              {isLoading ? "Comparing..." : "Compare Now"}
            </button>
          </div>
        </div>
      </div>

      {comparisonData && (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mt-4 bg-white">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="border-bottom" style={{ backgroundColor: '#f8faff' }}>
                <tr>
                  <th className="p-4 text-muted small fw-bold">ATTRIBUTE</th>
                  <th className="p-4 fw-bold h5" style={{ color: '#1E3A8A' }}>{comparisonData.first.title}</th>
                  <th className="p-4 fw-bold h5" style={{ color: '#1E3A8A' }}>{comparisonData.second.title}</th>
                </tr>
              </thead>
              <tbody>
                {/* ID row removed per instructions */}
                {renderRow('Complexity Level', 'level')}
                {renderRow('Total Modules', 'totalModules')}
                {renderRow('Learning Topics', 'totalTopics')}
                {renderRow('Duration (Months)', 'estimatedDurationMonths')}
                
                <tr>
                  <td className="p-4 text-secondary small fw-bold text-uppercase">Salary Range</td>
                  <td className="p-4 text-success fw-bold">
                    {formatSalary(comparisonData.first.salaryMin)} - {formatSalary(comparisonData.first.salaryMax)}
                  </td>
                  <td className="p-4 text-success fw-bold">
                    {formatSalary(comparisonData.second.salaryMin)} - {formatSalary(comparisonData.second.salaryMax)}
                  </td>
                </tr>

                <tr>
                  <td className="p-4 text-secondary small fw-bold text-uppercase">Required Skills</td>
                  <td className="p-4 small text-muted">{comparisonData.first.requiredSkills || 'N/A'}</td>
                  <td className="p-4 small text-muted">{comparisonData.second.requiredSkills || 'N/A'}</td>
                </tr>

                <tr>
                  <td className="p-4 text-secondary small fw-bold text-uppercase">Highlight Tags</td>
                  <td className="p-4">
                    {getTags(comparisonData.first.highlightTags).map((tag, i) => (
                      <span key={i} className="badge bg-primary bg-opacity-10 text-primary border-0 me-1 mb-1 px-3 py-2">{tag}</span>
                    ))}
                  </td>
                  <td className="p-4">
                    {getTags(comparisonData.second.highlightTags).map((tag, i) => (
                      <span key={i} className="badge bg-primary bg-opacity-10 text-primary border-0 me-1 mb-1 px-3 py-2">{tag}</span>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleSelect} 
        existingPaths={selectedPaths.filter(p => p !== null)} 
      />
    </div>
  );
}