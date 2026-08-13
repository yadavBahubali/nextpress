"use client";

import React from "react";
import { FaBars, FaTrash, FaCopy, FaChevronRight } from "react-icons/fa";
import { useBuilderStore, FieldSchema } from "@/app/[admin]/blogs/builder/store";

interface FieldCardProps {
  field: FieldSchema;
  depth?: number;
}

export default function FieldCard({ field, depth = 0 }: FieldCardProps) {
  const { activeFieldId, setActiveField, removeField } = useBuilderStore();
  const isActive = activeFieldId === field.id;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this field?")) {
      removeField(field.id);
    }
  };

  return (
    <div 
      className={`field-card-container mb-2 ${depth > 0 ? 'ms-4' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setActiveField(field.id);
      }}
    >
      <div 
        className={`card border-0 shadow-sm ${isActive ? 'border-start border-4 border-primary' : 'border-start border-4 border-transparent'} hover-shadow transition-all cursor-pointer`}
      >
        <div className="card-body p-3 d-flex align-items-center">
          <div className="drag-handle text-muted me-3 cursor-grab">
            <FaBars />
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark">{field.label || "(Untitled)"}</span>
              <span className="badge bg-light text-muted border small font-monospace">{field.name}</span>
            </div>
            <div className="small text-muted text-uppercase mt-1" style={{ fontSize: '10px' }}>
              {field.type}
            </div>
          </div>

          <div className="actions d-flex align-items-center gap-2">
            {isActive && <FaChevronRight className="text-primary me-2 animated-flicker" />}
            <button className="btn btn-sm btn-link text-muted p-0" title="Clone Field">
              <FaCopy />
            </button>
            <button 
              className="btn btn-sm btn-link text-danger p-0" 
              title="Delete Field"
              onClick={handleRemove}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {/* Recursive sub-fields for structural fields */}
      {(field.type === 'repeater' || field.type === 'accordion' || field.type === 'tabs') && field.subFields && (
        <div className="sub-fields-nesting mt-3 pb-2 border-start border-2 border-dashed ms-3 ps-3">
          <div className="small text-muted mb-2 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
            {field.type} sub-fields
          </div>
          {field.subFields.map((subField) => (
            <FieldCard key={subField.id} field={subField} depth={depth + 1} />
          ))}
          <button 
            className="btn btn-xs btn-outline-primary border-dashed w-100 py-1 mt-2"
            onClick={(e) => {
              e.stopPropagation();
              useBuilderStore.getState().addField(field.id);
            }}
          >
            + Add to {field.type}
          </button>
        </div>
      )}
    </div>
  );
}
