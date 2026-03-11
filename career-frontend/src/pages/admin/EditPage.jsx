import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function EditRoadmap() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [structureChanged, setStructureChanged] = useState(false);

  // Metadata
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState(0);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [skills, setSkills] = useState("");
  const [tags, setTags] = useState("");

  const [modules, setModules] = useState([]);

  useEffect(() => {

    const fetchRoadmap = async () => {

      try {

        const res = await axiosClient.get(`/api/roadmaps/${id}`);
        const data = res.data;

        setTitle(data.title);
        setLevel(data.level || "Beginner");

        // FIXED FIELD NAMES
        setDuration(data.estimated_duration_months || 0);
        setSalaryMin(data.salary_min || 0);
        setSalaryMax(data.salary_max || 0);

        setSkills(data.required_skills || "");
        setTags(data.highlight_tags || "");

        // FIXED STRUCTURE FIELD
        const structure =
          typeof data.structure_json === "string"
            ? JSON.parse(data.structure_json)
            : data.structure_json || [];

        setModules(structure);

        setLoading(false);

      } catch (err) {

        console.log(err);
        toast.error("Failed to load roadmap");
        navigate("/admin/roadmaps");

      }

    };

    fetchRoadmap();

  }, [id, navigate]);


  const notifyChange = (newModules) => {
    setModules(newModules);
    setStructureChanged(true);
  };

  // ---------------- Modules ----------------

  const addModule = () =>
    notifyChange([
      ...modules,
      { id: `M${modules.length + 1}`, title: "", topics: [] },
    ]);

  const removeModule = (mIdx) =>
    notifyChange(modules.filter((_, i) => i !== mIdx));

  // ---------------- Topics ----------------

  const addTopic = (mIdx) => {

    const newModules = [...modules];

    const tId = `${newModules[mIdx].id}T${newModules[mIdx].topics.length + 1}`;

    newModules[mIdx].topics.push({
      id: tId,
      title: "",
      resources: { free: [], paid: [] },
      subtopics: [],
    });

    notifyChange(newModules);

  };

  const removeTopic = (mIdx, tIdx) => {

    const newModules = [...modules];
    newModules[mIdx].topics = newModules[mIdx].topics.filter(
      (_, i) => i !== tIdx
    );

    notifyChange(newModules);

  };

  // ---------------- Subtopics ----------------

  const addSubtopic = (mIdx, tIdx) => {

    const newModules = [...modules];

    const sId = `${newModules[mIdx].topics[tIdx].id}S${
      newModules[mIdx].topics[tIdx].subtopics.length + 1
    }`;

    newModules[mIdx].topics[tIdx].subtopics.push({
      id: sId,
      title: "",
    });

    notifyChange(newModules);

  };

  const removeSubtopic = (mIdx, tIdx, sIdx) => {

    const newModules = [...modules];

    newModules[mIdx].topics[tIdx].subtopics =
      newModules[mIdx].topics[tIdx].subtopics.filter((_, i) => i !== sIdx);

    notifyChange(newModules);

  };

  // ---------------- Resources ----------------

  const updateResource = (mIdx, tIdx, type, field, val) => {

    const newModules = [...modules];
    const topic = newModules[mIdx].topics[tIdx];

    if (!topic.resources) topic.resources = { free: [], paid: [] };

    if (!topic.resources[type][0])
      topic.resources[type][0] = { title: "", url: "" };

    topic.resources[type][0][field] = val;

    notifyChange(newModules);

  };

  // ---------------- Save ----------------

  const handleSave = async () => {

    const basePayload = {
      title,
      level,
      estimated_duration_months: Number(duration),
      salary_min: Number(salaryMin),
      salary_max: Number(salaryMax),
      required_skills: skills,
      highlight_tags: tags,
    };

    try {

      if (structureChanged) {

        await axiosClient.put(`/api/admin/roadmaps/${id}`, {
          ...basePayload,
          structure_json: JSON.stringify(modules),
        });

        toast.success("Full Update Successful (PUT)");

      } else {

        await axiosClient.patch(`/api/admin/roadmaps/${id}`, basePayload);

        toast.success("Metadata Updated (PATCH)");

      }

      navigate("/admin/roadmaps");

    } catch (err) {

      toast.error(err.response?.data?.message || "Update failed");

    }

  };

  if (loading)
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (

    <div className="p-4 bg-light min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h3 className="fw-bold mb-0">Edit Roadmap: {title}</h3>

        <div className="d-flex gap-2">

          <button
            className="btn btn-white border fw-bold"
            onClick={() => navigate("/admin/roadmaps")}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary fw-bold px-4 shadow-sm"
            onClick={handleSave}
          >
            Save {structureChanged ? "(PUT)" : "(PATCH)"}
          </button>

        </div>

      </div>

      <div className="row g-4">

        {/* LEFT PANEL */}

        <div className="col-lg-4">

          <div className="card border-0 shadow-sm rounded-4 p-4">

            <h6 className="fw-bold mb-3 border-bottom pb-2">
              Roadmap Metadata
            </h6>

            <div className="mb-3">

              <label className="form-label small fw-bold">Title</label>

              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            </div>

            <div className="mb-3">

              <label className="form-label small fw-bold">Level</label>

              <select
                className="form-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

            </div>

            <div className="mb-3">

              <label className="form-label small fw-bold">
                Duration (Months)
              </label>

              <input
                type="number"
                className="form-control"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />

            </div>

            <div className="row g-2 mb-3">

              <div className="col-6">

                <label className="form-label small fw-bold">Min Salary</label>

                <input
                  type="number"
                  className="form-control"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />

              </div>

              <div className="col-6">

                <label className="form-label small fw-bold">Max Salary</label>

                <input
                  type="number"
                  className="form-control"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />

              </div>

            </div>

            {/* NEW FIELDS */}

            <div className="mb-3">

              <label className="form-label small fw-bold">
                Required Skills
              </label>

              <input
                type="text"
                className="form-control"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />

            </div>

            <div className="mb-3">

              <label className="form-label small fw-bold">
                Highlight Tags
              </label>

              <input
                type="text"
                className="form-control"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />

            </div>

          </div>

        </div>

        {/* RIGHT PANEL STRUCTURE */}

        <div className="col-lg-8">

          <div className="card border-0 shadow-sm rounded-4 p-4">

            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">

              <h6 className="fw-bold mb-0">Structure Builder</h6>

              <button
                className="btn btn-sm btn-primary fw-bold"
                onClick={addModule}
              >
                + Add Module
              </button>

            </div>

            {modules.map((mod, mIdx) => (

              <div
                key={mod.id}
                className="mb-4 p-3 border rounded-3 bg-white shadow-sm"
              >

                <div className="d-flex gap-2 mb-3 align-items-center">

                  <span className="badge bg-primary">{mod.id}</span>

                  <input
                    type="text"
                    className="form-control fw-bold border-0 bg-light"
                    value={mod.title}
                    onChange={(e) => {
                      const n = [...modules];
                      n[mIdx].title = e.target.value;
                      notifyChange(n);
                    }}
                  />

                  <button
                    className="btn btn-sm text-danger border-0"
                    onClick={() => removeModule(mIdx)}
                  >
                    🗑
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