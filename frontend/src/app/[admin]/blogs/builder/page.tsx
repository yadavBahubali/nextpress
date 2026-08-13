"use client";

import React from "react";
import { 
  FaSave, FaCog, FaCubes, FaArrowLeft, FaEye, FaTools, 
  FaCode, FaPlus, FaLayerGroup, FaPlusCircle, FaChevronDown
} from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSchemaStore, FieldType } from "./store";
import FieldTreeItem from "@/components/admin/field-builder/FieldTreeItem";
import FieldSettingsPanel from "@/components/admin/field-builder/FieldSettingsPanel";

const FIELD_TYPE_GROUPS = [
  { group: "Basic", items: ["text", "textarea", "number", "range", "email", "url", "password"] },
  { group: "Media", items: ["image", "file", "video", "gallery"] },
  { group: "Advanced", items: ["wysiwyg", "repeater", "clone", "accordion", "tabs"] },
  { group: "Selection", items: ["select", "checkbox", "radio", "button_group", "boolean"] },
  { group: "Utility", items: ["datepicker", "color_picker", "link"] }
];

export default function SchemaBuilder() {
  const params = useParams();
  const adminPath = params.admin as string;

  const { 
    currentPage, 
    activeSectionId, 
    activeFieldId,
    setPageTitle,
    addSection,
    setActiveSection,
    addField
  } = useSchemaStore();

  const activeSection = currentPage.sections.find(s => s.id === activeSectionId);

  return (
    <div className="headless-schema-builder pb-5 bg-light min-vh-100">
      {/* Top sticky header */}
      <div className="bg-white border-bottom px-4 py-3 sticky-top shadow-sm" style={{ zIndex: 1000 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link href={`/${adminPath}/pages`} className="btn btn-light btn-sm text-muted rounded-pill px-3">
              <FaArrowLeft className="me-1" /> Back
            </Link>
            <div className="vr h-25 my-auto"></div>
            <div>
              <input 
                type="text" 
                className="form-control form-control-sm border-0 bg-transparent fw-bold fs-5 p-0" 
                value={currentPage.title}
                onChange={e => setPageTitle(e.target.value)}
                placeholder="Enter Page Title..."
              />
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary bg-opacity-10 text-primary small">PAGE SCHEMA</span>
                <span className="text-muted small">/{currentPage.slug}</span>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-pill px-3">
              <FaCode /> View JSON
            </button>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm fw-bold">
              <FaSave /> Save Schema
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid mt-4">
        <div className="row g-4">
          
          {/* Left Column: Sections & Field Tree */}
          <div className="col-lg-8">
            
            {/* Sections Tab/Navigation */}
            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
              <h6 className="fw-bold mb-0 text-secondary text-uppercase tracking-wider">Page Sections</h6>
              <button className="btn btn-xs btn-success d-flex align-items-center gap-1 rounded-pill px-2 py-1" onClick={() => addSection()}>
                <FaPlus size={10} /> Add Section
              </button>
            </div>

            <div className="sections-nav d-flex gap-2 mb-4 overflow-auto pb-2">
              {currentPage.sections.map(sec => (
                <button 
                  key={sec.id}
                  className={`btn btn-sm px-4 py-2 rounded-pill shadow-xs transition-all border-0 ${activeSectionId === sec.id ? 'btn-primary shadow-sm' : 'btn-white text-muted hover-bg-light'}`}
                  onClick={() => setActiveSection(sec.id)}
                >
                  <FaLayerGroup className="me-2" size={12} />
                  {sec.name}
                </button>
              ))}
              {currentPage.sections.length === 0 && (
                <div className="text-muted small p-3 bg-white rounded-4 border border-dashed w-100 text-center">
                  No sections created. Click "Add Section" to begin.
                </div>
              )}
            </div>

            {activeSection && (
              <div className="active-section-container">
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                          <FaCubes className="text-primary" /> {activeSection.name}
                        </h5>
                        <code className="text-muted small">ID: {activeSection.slug}</code>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          <FaPlusCircle /> Add Field
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2 mt-2" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                          <li className="px-3 py-2 border-bottom mb-2">
                            <span className="fw-bold text-muted small text-uppercase">Select Field Type</span>
                          </li>
                          {FIELD_TYPE_GROUPS.map(g => (
                            <React.Fragment key={g.group}>
                              <li className="dropdown-header text-primary fw-bold small mt-2">{g.group}</li>
                              {g.items.map(type => (
                                <li key={type}>
                                  <button 
                                    className="dropdown-item rounded-3 py-2 small d-flex align-items-center" 
                                    onClick={() => addField(activeSection.id, undefined, type as FieldType)}
                                  >
                                    <span className="me-2 text-muted opacity-50"><FaCubes size={10} /></span>
                                    {type.replace('_', ' ').toUpperCase()}
                                  </button>
                                </li>
                              ))}
                            </React.Fragment>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="field-tree-wrapper">
                      {activeSection.fields.map(field => (
                        <FieldTreeItem key={field.id} field={field} sectionId={activeSection.id} />
                      ))}
                      {activeSection.fields.length === 0 && (
                        <div className="text-center py-5 bg-light bg-opacity-50 rounded-4 border border-dashed">
                          <FaPlusCircle size={48} className="text-muted opacity-25 mb-3" />
                          <p className="text-muted">No fields in this section yet.</p>
                          <button className="btn btn-sm btn-outline-primary rounded-pill px-4" onClick={() => addField(activeSection.id)}>Add First Field</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Settings Panel */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: "100px" }}>
              <FieldSettingsPanel />
              
              {/* Schema Debugger */}
              <div className="mt-4 p-3 bg-dark text-light rounded-4 shadow-sm overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-info font-monospace">Schema JSON</span>
                  <button className="btn btn-xs btn-outline-info p-1 py-0 rounded" style={{ fontSize: '10px' }} onClick={() => console.log(currentPage)}>Log Output</button>
                </div>
                <pre className="small mb-0 opacity-75" style={{ fontSize: '10px' }}>
                  {JSON.stringify(currentPage, null, 2)}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
