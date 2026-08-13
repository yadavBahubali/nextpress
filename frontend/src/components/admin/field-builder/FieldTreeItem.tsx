"use client";

import React from "react";
import { 
  FaBars, FaTrash, FaPlus, FaChevronRight, FaLayerGroup, 
  FaFolderOpen, FaCubes, FaChevronDown, FaCode, FaClone
} from "react-icons/fa";
import { useSchemaStore, FieldSchema, FieldType } from "@/app/[admin]/blogs/builder/store";

interface FieldTreeItemProps {
  field: FieldSchema;
  sectionId: string;
  depth?: number;
}

export default function FieldTreeItem({ field, sectionId, depth = 0 }: FieldTreeItemProps) {
  const { activeFieldId, setActiveField, removeField, addField } = useSchemaStore();
  const isActive = activeFieldId === field.id;
  const isStructural = ['repeater', 'accordion', 'tabs', 'clone'].includes(field.type);

  const handleAddField = (e: React.MouseEvent, type: FieldType = 'text') => {
    e.stopPropagation();
    addField(sectionId, field.id, type);
  };

  return (
    <div className={`field-tree-node ${depth > 0 ? 'ms-4 mt-2' : 'mb-3'}`}>
      <div 
        className={`card border-0 shadow-sm overflow-hidden transition-all cursor-pointer ${isActive ? 'ring-primary border-start border-4 border-primary' : 'hover-bg-light border-start border-4 border-transparent'}`}
        onClick={() => setActiveField(field.id)}
      >
        <div className="card-body p-3 d-flex align-items-center">
          <div className="drag-handle text-muted me-3">
            <FaBars size={12} />
          </div>
          
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <span className={`fw-bold ${isActive ? 'text-primary' : 'text-dark'}`}>{field.label}</span>
              <code className="text-muted small">[{field.name}]</code>
            </div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="badge bg-light text-muted border text-uppercase" style={{ fontSize: '9px' }}>{field.type}</span>
              {field.settings.required && <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '9px' }}>Required</span>}
            </div>
          </div>

          <div className="actions d-flex gap-2">
            {isStructural && (
              <button 
                className="btn btn-xs btn-outline-primary p-1 rounded-circle" 
                title={`Add sub-field to ${field.type}`}
                onClick={handleAddField}
              >
                <FaPlus size={10} />
              </button>
            )}
            <button 
              className="btn btn-xs btn-link text-danger p-0" 
              onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
            >
              <FaTrash size={12} />
            </button>
            {isActive && <FaChevronRight className="text-primary ms-1" size={12} />}
          </div>
        </div>
      </div>

      {/* Recursive Children */}
      {isStructural && (
        <div className="field-children-container border-start border-2 border-dashed ms-3 ps-3 mt-2">
          {field.subFields?.map((sub) => (
            <FieldTreeItem key={sub.id} field={sub} sectionId={sectionId} depth={depth + 1} />
          ))}
          {(!field.subFields || field.subFields.length === 0) && (
            <div className="text-muted small py-2 fst-italic">Empty {field.type} - click + to add fields</div>
          )}
        </div>
      )}
    </div>
  );
}
