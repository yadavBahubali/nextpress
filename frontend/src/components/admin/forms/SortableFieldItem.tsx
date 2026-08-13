"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { FormField } from "@/services/forms.service";

const TYPES_WITH_OPTIONS = ["select", "radio"];
// A checkbox is a single yes/no field, so placeholder/options don't apply to it.
const TYPES_WITHOUT_PLACEHOLDER = ["checkbox"];

interface Props {
  field: FormField;
  index: number;
  isDuplicateName: boolean;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onRemove: (fieldId: string) => void;
}

export default function SortableFieldItem({ field, index, isDuplicateName, onUpdate, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const showOptions = TYPES_WITH_OPTIONS.includes(field.type);
  const showPlaceholder = !TYPES_WITHOUT_PLACEHOLDER.includes(field.type);

  const handleAddOption = () => {
    const options = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onUpdate(field.id, { options });
  };

  const handleUpdateOption = (idx: number, value: string) => {
    const options = [...(field.options || [])];
    options[idx] = value;
    onUpdate(field.id, { options });
  };

  const handleRemoveOption = (idx: number) => {
    const options = (field.options || []).filter((_, i) => i !== idx);
    onUpdate(field.id, { options });
  };

  return (
    <div ref={setNodeRef} style={style} className="field-item border rounded-3 p-3 bg-light bg-opacity-50">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="d-flex align-items-center gap-2">
          <span
            className="text-muted"
            style={{ cursor: "grab", touchAction: "none" }}
            {...attributes}
            {...listeners}
          >
            <FaGripVertical />
          </span>
          <span className="badge bg-primary">#{index + 1}</span>
          <strong className="text-dark">{field.label || "Unnamed Field"}</strong>
        </div>
        <button className="btn btn-sm btn-outline-danger border-0" onClick={() => onRemove(field.id)}>
          <FaTrash size={12} />
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <label className="small text-muted fw-bold mb-1">Label</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <label className="small text-muted fw-bold mb-1">Name (Internal)</label>
          <input
            type="text"
            className={`form-control form-control-sm ${isDuplicateName ? "is-invalid" : ""}`}
            value={field.name}
            onChange={(e) => onUpdate(field.id, { name: e.target.value })}
          />
          {isDuplicateName && (
            <div className="invalid-feedback">Another field already uses this name - submissions will overwrite each other.</div>
          )}
        </div>
        <div className="col-md-4">
          <label className="small text-muted fw-bold mb-1">Type</label>
          <select
            className="form-select form-select-sm"
            value={field.type}
            onChange={(e) => onUpdate(field.id, { type: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="textarea">Textarea</option>
            <option value="select">Dropdown</option>
            <option value="radio">Radio Group</option>
            <option value="checkbox">Checkbox</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="small text-muted fw-bold mb-1">Width (Bootstrap)</label>
          <select
            className="form-select form-select-sm"
            value={field.width}
            onChange={(e) => onUpdate(field.id, { width: e.target.value })}
          >
            <option value="col-12">Full Width (100%)</option>
            <option value="col-md-6">Half Width (50%)</option>
            <option value="col-md-4">One Third (33%)</option>
          </select>
        </div>
        {showPlaceholder && (
          <div className="col-md-4">
            <label className="small text-muted fw-bold mb-1">Placeholder</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={field.placeholder || ""}
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
            />
          </div>
        )}
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={`req_${field.id}`}
              checked={!!field.required}
              onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
            />
            <label className="form-check-label small fw-bold" htmlFor={`req_${field.id}`}>
              Required Field
            </label>
          </div>
        </div>

        {showOptions && (
          <div className="col-12">
            <label className="small text-muted fw-bold mb-1 d-block">
              Choices - what a visitor can pick from
            </label>
            <div className="d-flex flex-column gap-2">
              {(field.options || []).map((opt, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger border-0"
                    onClick={() => handleRemoveOption(idx)}
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary align-self-start d-flex align-items-center gap-1"
                onClick={handleAddOption}
              >
                <FaPlus size={10} /> Add Choice
              </button>
              {(!field.options || field.options.length === 0) && (
                <div className="small text-danger">This field has no choices yet - it won&apos;t be usable until you add at least one.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
