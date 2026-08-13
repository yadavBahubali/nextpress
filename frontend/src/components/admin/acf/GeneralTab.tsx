"use client";

import React, { useState, useRef, useEffect } from "react";
import { useACFStore } from "@/store/acfStore";
import { FieldType } from "@/types/acf";
import { createFieldByType } from "@/lib/acf/createFieldByType";

interface Props {
  field: any;
}

const FIELD_GROUPS = [
  {
    label: "Basic",
    options: [
      { value: "text", label: "Text" },
      { value: "textarea", label: "Textarea" },
      { value: "number", label: "Number" },
      { value: "email", label: "Email" },
      { value: "url", label: "URL" },
      { value: "password", label: "Password" },
    ],
  },
  {
    label: "Content",
    options: [
      { value: "wysiwyg", label: "Wysiwyg Editor" },
      { value: "image", label: "Image" },
      { value: "file", label: "File" },
      { value: "gallery", label: "Gallery" },
    ],
  },
  {
    label: "Choice",
    options: [
      { value: "select", label: "Select" },
      { value: "checkbox", label: "Checkbox" },
      { value: "radio", label: "Radio" },
      { value: "true_false", label: "True / False" },
    ],
  },
  {
    label: "Layout",
    options: [
      { value: "tab", label: "Tab" },
      { value: "accordion", label: "Accordion" },
      { value: "repeater", label: "Repeater" },
    ],
  },
  {
    label: "Relational",
    options: [
      { value: "user", label: "User (Assign To)" },
    ],
  },
];

export default function GeneralTab({ field }: Props) {
  const { updateField } = useACFStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeChange = (type: FieldType) => {
    const updatedField = createFieldByType(field, type);
    // In our Redux slice, we can update multiple keys or replace the field structure
    // For now, let's just update the core type and settings
    updateField(field.id, "type", type);
    updateField(field.id, "settings", updatedField.settings);
    if ((updatedField as any).subFields) {
      updateField(field.id, "subFields", (updatedField as any).subFields);
    }
    setIsDropdownOpen(false);
  };

  const handleLabelChange = (newLabel: string) => {
    updateField(field.id, "label", newLabel);

    // Auto-generate name from label
    const newName = newLabel
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/_+/g, "_");
    updateField(field.id, "name", newName);
  };

  const handleNameChange = (newName: string) => {
    const sanitized = newName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/_+/g, "_");
    updateField(field.id, "name", sanitized);
  };

  const handleDefaultValueChange = (val: string) => {
    updateField(field.id, "defaultValue", val);
  };

  const currentSelectedLabel =
    FIELD_GROUPS.flatMap((g) => g.options).find(
      (opt) => opt.value === field.type,
    )?.label || "Select Type";
  return (
    <div className="acf-general-tab">
      <div className="row g-4">
        {/* Field Type & Label */}
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column gap-4">
            {/* Field Type */}
            <div>
              <label className="acf-label">Field Type</label>
               <p className="acf-hint">Select Any Field type.</p>
              <div className="position-relative" ref={dropdownRef}>
                <div
                  className={`form-select form-select-sm border-solid d-flex align-items-center justify-content-between modern-select-trigger ${
                    isDropdownOpen ? "focused" : ""
                  }`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  tabIndex={0}
                >
                  <span>{currentSelectedLabel}</span>
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu show w-100 shadow-lg border-0 mt-1 modern-dropdown-menu">
                    {FIELD_GROUPS.map((group, groupIndex) => (
                      <div key={group.label} className="mb-2">
                        {groupIndex > 0 && (
                          <hr className="dropdown-divider my-2 opacity-25" />
                        )}
                        <h6 className="dropdown-header text-primary fw-bold text-uppercase modern-group-label">
                          {group.label}
                        </h6>
                        <div className="d-flex flex-column gap-1 px-2">
                          {group.options.map((opt) => {
                            const isActive = field.type === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                className={`dropdown-item rounded-2 py-2 px-3 modern-dropdown-item ${
                                  isActive ? "active-item" : ""
                                }`}
                                onClick={() =>
                                  handleTypeChange(opt.value as FieldType)
                                }
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field Label */}
            <div>
              <label className="acf-label">Field Label</label>
              <p className="acf-hint">Shown on the edit page.</p>
              <input
                type="text"
                className="form-control form-control-sm border-solid"
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Field Name & Default Value */}
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column gap-4">
            {/* Field Name */}
            {!["tab", "accordion"].includes(field.type) && (
              <div>
                <label className="acf-label">Field Name</label>
                <p className="acf-hint">
                  Auto-generated from label, but can be customized.
                </p>
                <div className="input-group input-group-sm">
                  <span
                    className="input-group-text text-muted font-monospace"
                    style={{ fontSize: "0.75rem" }}
                  >
                    field_
                  </span>
                  <input
                    type="text"
                    className="form-control font-monospace border-solid"
                    value={field.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    title="This field is auto-generated from the label"
                  />
                </div>
              </div>
            )}

            {!["tab", "accordion"].includes(field.type) && (
              <div>
                <label className="acf-label">Default Value</label>
                <p className="acf-hint">Pre-filled value for new entries.</p>
                <input
                  type="text"
                  className="form-control form-control-sm border-solid"
                  value={field.defaultValue || ""}
                  onChange={(e) => handleDefaultValueChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .acf-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #495057;
          margin-bottom: 4px;
        }
        .acf-hint {
          font-size: 0.78rem;
          color: #868e96;
          margin-bottom: 6px;
        }
        .form-control:focus,
        .form-select:focus,
        .modern-select-trigger.focused {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          outline: none;
        }

        /* Modern Select Custom Styles */
        .modern-select-trigger {
          cursor: pointer;
          user-select: none;
          background-color: #fff;
        }
        .modern-dropdown-menu {
          max-height: 320px;
          overflow-y: auto;
          z-index: 1050;
          border-radius: 0.5rem;
          padding-top: 0.5rem;
          padding-bottom: 3.5rem;
        }
        /* Custom Scrollbar for Dropdown */
        .modern-dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }
        .modern-dropdown-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .modern-dropdown-menu::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        .modern-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .modern-group-label {
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .modern-dropdown-item {
          font-size: 0.85rem;
          transition: all 0.15s ease-in-out;
          color: #333;
        }
        .modern-dropdown-item:hover {
          background-color: #f8f9fa;
          color: #0d6efd;
        }
        .modern-dropdown-item.active-item {
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
