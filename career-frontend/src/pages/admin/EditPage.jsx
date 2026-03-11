import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function EditRoadmap() {
const { id } = useParams();
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [structureChanged, setStructureChanged] = useState(false);

// Metadata State
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
const res = await axiosClient.get(/api/roadmaps/${id});
const data = res.data;
setTitle(data.title);
setLevel(data.level || "Beginner");
setDuration(data.estimatedDurationMonths || 0);
setSalaryMin(data.salaryMin || 0);
setSalaryMax(data.salaryMax || 0);
setSkills(data.requiredSkills || "");
setTags(data.highlightTags || "");
setModules(typeof data.structureJson === 'string' ? JSON.parse(data.structureJson) : data.structureJson || []);
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

// --- Hierarchical Logic ---
const addModule = () => notifyChange([...modules, { id: M${modules.length + 1}, title: "", topics: [] }]);

const removeModule = (mIdx) => notifyChange(modules.filter((_, i) => i !== mIdx));

const addTopic = (mIdx) => {
const newModules = [...modules];
const tId = ${newModules[mIdx].id}T${newModules[mIdx].topics.length + 1};
newModules[mIdx].topics.push({ id: tId, title: "", resources: { free: [], paid: [] }, subtopics: [] });
notifyChange(newModules);
};

const removeTopic = (mIdx, tIdx) => {
const newModules = [...modules];
newModules[mIdx].topics = newModules[mIdx].topics.filter((_, i) => i !== tIdx);
notifyChange(newModules);
};

const addSubtopic = (mIdx, tIdx) => {
const newModules = [...modules];
const sId = ${newModules[mIdx].topics[tIdx].id}S${newModules[mIdx].topics[tIdx].subtopics.length + 1};
newModules[mIdx].topics[tIdx].subtopics.push({ id: sId, title: "" });
notifyChange(newModules);
};

const removeSubtopic = (mIdx, tIdx, sIdx) => {
const newModules = [...modules];
newModules[mIdx].topics[tIdx].subtopics = newModules[mIdx].topics[tIdx].subtopics.filter((_, i) => i !== sIdx);
notifyChange(newModules);
};

const updateResource = (mIdx, tIdx, type, field, val) => {
const newModules = [...modules];
const topic = newModules[mIdx].topics[tIdx];
if (!topic.resources) topic.resources = { free: [], paid: [] };
if (!topic.resources[type][0]) topic.resources[type][0] = { title: "", url: "" };
topic.resources[type][0][field] = val;
notifyChange(newModules);
};

const handleSave = async () => {
const basePayload = { title, level, estimatedDurationMonths: Number(duration), salaryMin: Number(salaryMin), salaryMax: Number(salaryMax), requiredSkills: skills, highlightTags: tags };
try {
if (structureChanged) {
await axiosClient.put(/api/admin/roadmaps/${id}, { ...basePayload, structureJson: JSON.stringify(modules) });
toast.success("Full Update Successful (PUT)");
} else {
await axiosClient.patch(/api/admin/roadmaps/${id}, basePayload);
toast.success("Metadata Updated (PATCH)");
}
navigate("/admin/roadmaps");
} catch (err) {
toast.error(err.response?.data?.message || "Update failed");
}
};

if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

return (
<div className="p-4 bg-light min-vh-100" style={{ fontFamily: "'Inter', sans-serif" }}>
<div className="d-flex justify-content-between align-items-center mb-4">
<h3 className="fw-bold mb-0">Edit Roadmap: {title}</h3>
<div className="d-flex gap-2">
<button className="btn btn-white border fw-bold" onClick={() => navigate("/admin/roadmaps")}>Cancel</button>
<button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={handleSave}>Save {structureChanged ? "(PUT)" : "(PATCH)"}</button>
</div>
</div>
<div className="row g-4">
<div className="col-lg-4">
<div className="card border-0 shadow-sm rounded-4 p-4">
<h6 className="fw-bold mb-3 border-bottom pb-2">Roadmap Metadata</h6>
<div className="mb-3"><label className="form-label small fw-bold">Title</label><input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
<div className="mb-3"><label className="form-label small fw-bold">Level</label><select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
<div className="mb-3"><label className="form-label small fw-bold">Duration (Months)</label><input type="number" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
<div className="row g-2">
<div className="col-6"><label className="form-label small fw-bold">Min Salary</label><input type="number" className="form-control" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} /></div>
<div className="col-6"><label className="form-label small fw-bold">Max Salary</label><input type="number" className="form-control" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} /></div>
</div>
</div>
</div>
<div className="col-lg-8">
<div className="card border-0 shadow-sm rounded-4 p-4">
<div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2"><h6 className="fw-bold mb-0">Structure Builder</h6><button className="btn btn-sm btn-primary fw-bold" onClick={addModule}>+ Add Module</button></div>
{modules.map((mod, mIdx) => (
<div key={mod.id} className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
<div className="d-flex gap-2 mb-3 align-items-center"><span className="badge bg-primary">{mod.id}</span><input type="text" className="form-control fw-bold border-0 bg-light" value={mod.title} onChange={(e) => { const n = [...modules]; n[mIdx].title = e.target.value; notifyChange(n); }} /><button className="btn btn-sm text-danger border-0" onClick={() => removeModule(mIdx)}><i className="bi bi-trash"></i></button></div>
<div className="ms-4 border-start ps-3">
{mod.topics.map((top, tIdx) => (
<div key={top.id} className="mb-3 p-3 bg-light rounded-3 border">
<div className="d-flex gap-2 mb-2"><input type="text" className="form-control form-control-sm fw-bold" placeholder="Topic Title" value={top.title} onChange={(e) => { const n = [...modules]; n[mIdx].topics[tIdx].title = e.target.value; notifyChange(n); }} /><button className="btn btn-sm text-danger border-0" onClick={() => removeTopic(mIdx, tIdx)}><i className="bi bi-x"></i></button></div>
<div className="row g-2 mb-2">
<div className="col-6"><input type="text" className="form-control form-control-sm" placeholder="Free Res Title" value={top.resources?.free[0]?.title || ""} onChange={(e) => updateResource(mIdx, tIdx, 'free', 'title', e.target.value)} /></div>
<div className="col-6"><input type="text" className="form-control form-control-sm" placeholder="Free Res URL" value={top.resources?.free[0]?.url || ""} onChange={(e) => updateResource(mIdx, tIdx, 'free', 'url', e.target.value)} /></div>
</div>
<div className="ms-4 border-start ps-3">
{top.subtopics.map((sub, sIdx) => (
<div key={sub.id} className="d-flex gap-1 mb-1"><input type="text" className="form-control form-control-sm" value={sub.title} onChange={(e) => { const n = [...modules]; n[mIdx].topics[tIdx].subtopics[sIdx].title = e.target.value; notifyChange(n); }} /><button className="btn btn-sm text-muted py-0" onClick={() => removeSubtopic(mIdx, tIdx, sIdx)}>×</button></div>
))}
<button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => addSubtopic(mIdx, tIdx)}>+ Add Subtopic</button>
</div>
</div>
))}
<button className="btn btn-link btn-sm p-0 text-decoration-none fw-bold" onClick={() => addTopic(mIdx)}>+ Add Topic</button>
</div>
</div>
))}
</div>
</div>
</div>
</div>
);
}

