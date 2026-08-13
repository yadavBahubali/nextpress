"use client";

import React from "react";
import { Field } from "@/types/acf";
import { useACFStore } from "@/store/acfStore";
import FieldHeader from "./FieldHeader";
import FieldTabs from "./FieldTabs";
import GeneralTab from "./GeneralTab";
import RepeaterFieldEditor from "./RepeaterFieldEditor";
import ChoicesFieldEditor from "./ChoicesFieldEditor";
import WysiwygFieldEditor from "./WysiwygFieldEditor";
import MediaFieldEditor from "./MediaFieldEditor";
import TabFieldEditor from "./TabFieldEditor";
import AccordionFieldEditor from "./AccordionFieldEditor";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  field: Field;
  index: number;
}

export default function FieldCard({ field, index }: Props) {
  const { removeField, duplicateField, toggleField, updateField } = useACFStore();
  const activeTab = field.activeTab || "general";

  const handleRemoveField = (id: string) => {
    removeField(id);
  };

  const handleDuplicateField = (id: string) => {
    duplicateField(id);
  };

  const handleToggleField = (id: string) => {
    toggleField(id);
  };

  const handleUpdateField = (id: string, key: string, value: any) => {
    updateField(id, key, value);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: "relative" as any,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`acf-field-card ${field.open ? "is-open" : ""} ${isDragging ? "is-dragging" : ""}`}
    >
      <FieldHeader 
        field={field} 
        index={index} 
        dragHandleProps={{ ...attributes, ...listeners }}
      />

      {field.open && (
        <div className="acf-field-body">
          <FieldTabs fieldId={field.id} activeTab={activeTab} />

          <div className="p-4">
            {activeTab === "general" && (
              <>
                <GeneralTab field={field} />

                {/* TAB */}
                {field.type === "tab" && (
                  <TabFieldEditor field={field} />
                )}

                {/* ACCORDION */}
                {field.type === "accordion" && (
                  <AccordionFieldEditor field={field} />
                )}

                {/* REPEATER */}
                {field.type === "repeater" && (
                  <RepeaterFieldEditor field={field} />
                )}

                {/* CHOICE FIELDS */}
                {["select", "checkbox", "radio"].includes(field.type) && (
                  <ChoicesFieldEditor field={field} />
                )}
                {/* MEDIA FIELDS */}
                {["image", "file", "gallery"].includes(field.type) && (
                  <MediaFieldEditor field={field} />
                )}
                {/* WYSIWYG */}
                {field.type === "wysiwyg" && (
                  <WysiwygFieldEditor field={field} />
                )}
              </>
            )}

            {activeTab === "validation" && (
              <div className=" ">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <p className="fw-semibold mb-0 small">Required field</p>
                    <p
                      className="text-muted mb-0"
                      style={{ fontSize: "0.78rem" }}
                    >
                      Force users to fill in this field before submitting.
                    </p>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`required-${field.id}`}
                      checked={!!field.required}
                      onChange={(e) => handleUpdateField(field.id, "required", e.target.checked)}
                      style={{
                        width: "2.4em",
                        height: "1.25em",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "presentation" && (
              <div className=" ">
                {!["tab", "accordion"].includes(field.type) && (
                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold small text-uppercase text-muted"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      className="form-control border-solid"
                      value={field.placeholder || ""}
                      onChange={(e) => handleUpdateField(field.id, "placeholder", e.target.value)}
                      placeholder="Ghost text shown inside an empty input…"
                      style={{ fontSize: "0.9rem" }}
                    />
                    <div className="form-text">
                      Ghost text shown inside an empty input.
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label
                    className="form-label fw-semibold small text-uppercase text-muted"
                    style={{ letterSpacing: "0.05em" }}
                  >
                    Instructions
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={field.instructions || ""}
                    onChange={(e) => handleUpdateField(field.id, "instructions", e.target.value)}
                    placeholder="Help text shown below the field…"
                    style={{ resize: "vertical", fontSize: "0.9rem" }}
                  />
                  <div className="form-text">
                    Shown to editors below this field on the edit screen.
                  </div>
                </div>

                <label
                  className="form-label fw-semibold small text-uppercase text-muted mb-3"
                  style={{ letterSpacing: "0.05em" }}
                >
                  Wrapper attributes
                </label>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      Width %
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control border-solid"
                        value={field.wrapper?.width || ""}
                        onChange={(e) => handleUpdateField(field.id, "wrapper", { ...field.wrapper, width: e.target.value })}
                        placeholder="100%"
                      />
                      <span className="input-group-text text-muted">%</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      CSS Class
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm border-solid "
                      value={field.wrapper?.class || ""}
                      onChange={(e) => handleUpdateField(field.id, "wrapper", { ...field.wrapper, class: e.target.value })}
                      placeholder="my-field-class"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      ID
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm border-solid"
                      value={field.wrapper?.id || ""}
                      onChange={(e) => handleUpdateField(field.id, "wrapper", { ...field.wrapper, id: e.target.value })}
                      placeholder="my-field-id"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer actions ── */}
          <div className="d-flex align-items-center justify-content-between px-4 py-2 bg-light border-top">
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-link text-secondary text-decoration-none px-2 py-1 acf-action-btn"
                onClick={() => handleDuplicateField(field.id)}
              >
                <svg
                  className="me-1"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>

              <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                ·
              </span>

              <button className="btn btn-sm btn-link text-secondary text-decoration-none px-2 py-1 acf-action-btn">
                <svg
                  className="me-1"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="5 9 2 12 5 15" />
                  <polyline points="19 9 22 12 19 15" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                Move
              </button>

              <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                ·
              </span>
              <button
                className="btn btn-sm btn-link text-danger text-decoration-none px-2 py-1 acf-action-btn"
                onClick={() => handleRemoveField(field.id)}
              >
                <svg
                  className="me-1"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </button>
            </div>
            <button
              className="btn btn-sm btn-link text-muted text-decoration-none px-2 py-1 acf-action-btn"
              onClick={() => handleToggleField(field.id)}
            >
              <svg
                className="me-1"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Collapse
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .acf-field-card {
          border: 1px solid #dee2e6;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          transition: box-shadow 0.15s ease;
        }
        .acf-field-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
        }
        .acf-field-card.is-open {
          border-color: #0d6efd40;
          box-shadow:
            0 0 0 3px rgba(13, 110, 253, 0.06),
            0 2px 10px rgba(0, 0, 0, 0.06);
        }
        .acf-field-body {
          border-top: 1px solid #e9ecef;
        }
        .border-dashed {
          border-style: dashed !important;
        }
        .acf-action-btn {
          font-size: 0.78rem;
          border-radius: 5px;
          transition: background 0.12s;
        }
        .acf-action-btn:hover {
          background: #f1f3f5 !important;
        }
      `}</style>
    </div>
  );
}
