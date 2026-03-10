// src/components/roadmap/StructuredRoadmap.jsx
import React from 'react';
import './StructuredRoadmap.css';

const StructuredRoadmap = ({ data, onNodeClick }) => {
  const modules = Array.isArray(data) ? data : (data?.modules || []);

  return (
    <div className="roadmap-vertical-container mx-auto">
      {modules.map((module, mIdx) => (
        <section key={mIdx} className="roadmap-module-section mb-5">
          
          {/* Header remains clickable but text is removed */}
          <div 
            className="module-header shadow-sm p-4 mb-4 rounded-3 border-start border-primary border-5 clickable-node"
            onClick={() => onNodeClick(module, 'module')}
          >
            <h3 className="h5 fw-bold mb-0 text-dark text-uppercase letter-spacing-1">
              {module.title}
            </h3>
          </div>

          <div className="module-content-grid">
            {module.topics?.map((topic, tIdx) => (
              <div key={tIdx} className="topic-block mb-4 p-0 rounded-3 border bg-white overflow-hidden">
                <div 
                  className="topic-header-area p-3 border-bottom clickable-node d-flex justify-content-between align-items-center"
                  onClick={() => onNodeClick(topic, 'topic')}
                >
                  <h4 className="h6 fw-bold mb-0 text-secondary">{topic.title || topic}</h4>
                </div>

                <div className="subtopic-list d-flex flex-column p-2 gap-1">
                  {topic.subtopics?.map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      className="subtopic-row btn btn-link text-start text-decoration-none p-2 rounded border-0"
                      onClick={() => onNodeClick(sub, 'subtopic')}
                    >
                      • {typeof sub === 'object' ? sub.title : sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default StructuredRoadmap;