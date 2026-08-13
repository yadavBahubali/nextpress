"use client";

import React from "react";
import { Field } from "@/types/acf";
import { Plus, Trash2, Grip, MoveVertical } from "lucide-react";
import FieldRenderer from "../FieldRenderer";

interface Props {
  field: Field;
  value: any[];
  onChange: (value: any[]) => void;
  restrictedMediaUpload?: boolean;
}

export default function RepeaterField({ field, value = [], onChange, restrictedMediaUpload }: Props) {
  const subFields = (field as any).sub_fields || (field as any).subFields || [];
  
  const addRow = () => {
    const newRow: Record<string, any> = {};
    subFields.forEach((f: Field) => {
      newRow[f.name] = f.defaultValue || "";
    });
    onChange([...value, newRow]);
  };

  const removeRow = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const updateRowField = (index: number, fieldName: string, val: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [fieldName]: val };
    onChange(newValue);
  };

  return (
    <div className="acf-repeater border rounded-3 overflow-hidden bg-white">
      {/* HEADER */}
      <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
        <span className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: '0.05em' }}>
          {field.label} Rows ({value.length})
        </span>
      </div>

      {/* ROWS */}
      <div className="repeater-rows">
        {value.length === 0 ? (
          <div className="text-center py-4 text-muted small bg-light-subtle">
            No rows added yet.
          </div>
        ) : (
          value.map((row, index) => (
            <div key={index} className="repeater-row border-bottom last-child-border-0">
              <div className="d-flex">
                {/* ROW HANDLE / INDEX */}
                <div className="bg-light border-end d-flex flex-column align-items-center py-3" style={{ width: '40px' }}>
                  <span className="small text-muted fw-bold mb-2">{index + 1}</span>
                  <MoveVertical size={14} className="text-muted opacity-50 cursor-move" />
                </div>

                {/* ROW CONTENT */}
                <div className="flex-grow-1 p-4">
                  <div className="row g-4">
                    {subFields.map((subField: Field, subIdx: number) => (
                      <div 
                        key={subField.id || `subfield-${subField.name}-${subIdx}`} 
                        className="col-12"
                        style={{ width: subField.wrapper?.width || '100%' }}
                      >
                        <FieldRenderer
                          field={subField}
                          value={row[subField.name]}
                          onChange={(val) => updateRowField(index, subField.name, val)}
                          restrictedMediaUpload={restrictedMediaUpload}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROW ACTIONS */}
                <div className="p-3">
                  <button 
                    className="btn btn-sm btn-outline-danger p-1 rounded-circle"
                    onClick={() => removeRow(index)}
                    title="Remove Row"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER / ADD BUTTON */}
      <div className="p-3 bg-light border-top">
        <button 
          className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3"
          onClick={addRow}
        >
          <Plus size={16} />
          {field.settings?.buttonLabel || "Add Row"}
        </button>
      </div>

      <style jsx>{`
        .last-child-border-0:last-child {
          border-bottom: 0 !important;
        }
        .cursor-move {
          cursor: move;
        }
      `}</style>
    </div>
  );
}
