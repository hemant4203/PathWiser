import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function CreateRoadmap() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState(0);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [skills, setSkills] = useState("");
  const [tags, setTags] = useState("");

  const [modules, setModules] = useState([
    { id: "M1", title: "", description: "", topics: [] }
  ]);

  const addModule = () => {
    const newId = `M${modules.length + 1}`;
    setModules([
      ...modules,
      { id: newId, title: "", description: "", topics: [] }
    ]);
  };

  const updateModuleTitle = (mIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].title = val;
    setModules(newModules);
  };

  const updateModuleDescription = (mIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].description = val;
    setModules(newModules);
  };

  const addTopic = (mIdx) => {
    const newModules = [...modules];
    const tId = `${newModules[mIdx].id}T${newModules[mIdx].topics.length + 1}`;

    newModules[mIdx].topics.push({
      id: tId,
      title: "",
      description: "",
      resources: {
        free: [],
        paid: []
      },
      subtopics: []
    });

    setModules(newModules);
  };

  const updateTopicTitle = (mIdx, tIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].title = val;
    setModules(newModules);
  };

  const updateTopicDescription = (mIdx, tIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].description = val;
    setModules(newModules);
  };

  const addSubtopic = (mIdx, tIdx) => {
    const newModules = [...modules];
    const sId = `${newModules[mIdx].topics[tIdx].id}S${newModules[mIdx].topics[tIdx].subtopics.length + 1}`;

    newModules[mIdx].topics[tIdx].subtopics.push({
      id: sId,
      title: "",
      description: ""
    });

    setModules(newModules);
  };

  const updateSubtopicTitle = (mIdx, tIdx, sIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].subtopics[sIdx].title = val;
    setModules(newModules);
  };

  const updateSubtopicDescription = (mIdx, tIdx, sIdx, val) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].subtopics[sIdx].description = val;
    setModules(newModules);
  };

  const addResource = (mIdx, tIdx, type) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].resources[type].push({
      title: "",
      url: ""
    });
    setModules(newModules);
  };

  const updateResource = (mIdx, tIdx, rIdx, type, field, val) => {
    const newModules = [...modules];
    newModules[mIdx].topics[tIdx].resources[type][rIdx][field] = val;
    setModules(newModules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      level,
      structureJson: JSON.stringify(modules),
      estimatedDurationMonths: Number(duration),
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      requiredSkills: skills,
      highlightTags: tags
    };

    try {
      await axiosClient.post("/api/admin/roadmaps", payload);
      toast.success("Roadmap created successfully!");
      navigate("/admin/roadmaps");
    } catch (err) {
      console.error("POST Error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to create roadmap");
    }
  };

  return (
    <div className="p-4 bg-light min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Create New Roadmap</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-light border" onClick={() => navigate("/admin/roadmaps")}>Cancel</button>
          <button className="btn btn-primary fw-bold" onClick={handleSubmit}>Create Roadmap</button>
        </div>
      </div>

      <div className="row g-4">

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-3">General Information</h6>

            <div className="mb-3">
              <label className="form-label small fw-bold">Roadmap Title</label>
              <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Level</label>
              <select className="form-select" value={level} onChange={(e)=>setLevel(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Duration</label>
              <input type="number" className="form-control" value={duration} onChange={(e)=>setDuration(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Salary Min</label>
              <input type="number" className="form-control" value={salaryMin} onChange={(e)=>setSalaryMin(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Salary Max</label>
              <input type="number" className="form-control" value={salaryMax} onChange={(e)=>setSalaryMax(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Required Skills</label>
              <input className="form-control" value={skills} onChange={(e)=>setSkills(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Highlight Tags</label>
              <input className="form-control" value={tags} onChange={(e)=>setTags(e.target.value)} />
            </div>

          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0">Structure Builder</h6>
              <button className="btn btn-sm btn-outline-primary fw-bold" onClick={addModule}>
                + Add Module
              </button>
            </div>

            {modules.map((mod,mIdx)=>(
              <div key={mod.id} className="mb-4 p-3 border rounded-3 bg-white">

                <div className="d-flex gap-2 mb-2">
                  <span className="badge bg-primary mt-1">{mod.id}</span>
                  <input
                    className="form-control form-control-sm fw-bold border-0 bg-light"
                    placeholder="Module Title"
                    value={mod.title}
                    onChange={(e)=>updateModuleTitle(mIdx,e.target.value)}
                  />
                </div>

                <textarea
                  className="form-control form-control-sm mb-3"
                  placeholder="Module Description"
                  value={mod.description}
                  onChange={(e)=>updateModuleDescription(mIdx,e.target.value)}
                />

                <div className="ms-4 border-start ps-3">

                  {mod.topics.map((top,tIdx)=>(
                    <div key={top.id} className="mb-3 border rounded p-2 bg-light bg-opacity-10">

                      <input
                        className="form-control form-control-sm mb-2 border-0 bg-light"
                        placeholder="Topic Title"
                        value={top.title}
                        onChange={(e)=>updateTopicTitle(mIdx,tIdx,e.target.value)}
                      />

                      <textarea
                        className="form-control form-control-sm mb-2"
                        placeholder="Topic Description"
                        value={top.description}
                        onChange={(e)=>updateTopicDescription(mIdx,tIdx,e.target.value)}
                      />

                      {["free","paid"].map(type=>(
                        <div key={type}>
                          {top.resources[type].map((res,rIdx)=>(
                            <div key={rIdx} className="d-flex gap-2 mb-2">
                              <input
                                className="form-control form-control-sm"
                                placeholder={`${type} resource title`}
                                value={res.title}
                                onChange={(e)=>updateResource(mIdx,tIdx,rIdx,type,"title",e.target.value)}
                              />
                              <input
                                className="form-control form-control-sm"
                                placeholder={`${type} resource url`}
                                value={res.url}
                                onChange={(e)=>updateResource(mIdx,tIdx,rIdx,type,"url",e.target.value)}
                              />
                            </div>
                          ))}
                          <button
                            className="btn btn-link btn-sm p-0"
                            onClick={()=>addResource(mIdx,tIdx,type)}
                          >
                            + Add {type} resource
                          </button>
                        </div>
                      ))}

                      <div className="ms-4 border-start ps-3">
                        {top.subtopics.map((sub,sIdx)=>(
                          <div key={sub.id} className="mb-2">
                            <input
                              className="form-control form-control-sm mb-1 border-0 bg-light"
                              placeholder="Subtopic Title"
                              value={sub.title}
                              onChange={(e)=>updateSubtopicTitle(mIdx,tIdx,sIdx,e.target.value)}
                            />
                            <textarea
                              className="form-control form-control-sm"
                              placeholder="Subtopic Description"
                              value={sub.description}
                              onChange={(e)=>updateSubtopicDescription(mIdx,tIdx,sIdx,e.target.value)}
                            />
                          </div>
                        ))}
                        <button className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={()=>addSubtopic(mIdx,tIdx)}>
                          + Add Subtopic
                        </button>
                      </div>

                    </div>
                  ))}

                  <button className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                    onClick={()=>addTopic(mIdx)}>
                    + Add Topic
                  </button>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}