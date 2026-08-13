"use client";

import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { FaPlus, FaTrash, FaBars } from "react-icons/fa";
import ContentFieldRenderer from "./ContentFieldRenderer";
import { FieldSchema } from "@/app/[admin]/blogs/builder/store";

interface RepeaterInputProps {
  field: FieldSchema;
  control: Control<any>;
  name: string; // The path in the form data (e.g., "hero.cards")
}

export default function RepeaterInput({ field, control, name }: RepeaterInputProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: name,
  });

  const handleAddRow = () => {
    const defaultValues: any = {};
    field.subFields?.forEach(sf => {
      defaultValues[sf.name] = sf.options.defaultValue || "";
    });
    append(defaultValues);
  };

  return (
    <div className="repeater-input-container border rounded bg-light p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="fw-bold text-muted small uppercase">{field.label} Rows</label>
        <button 
          type="button" 
          className="btn btn-sm btn-primary d-flex align-items-center gap-2"
          onClick={handleAddRow}
        >
          <FaPlus size={12} /> Add Row
        </button>
      </div>

      <div className="repeater-rows">
        {fields.map((item, index) => (
          <div key={item.id} className="repeater-row card mb-3 border-0 shadow-sm overflow-hidden">
            <div className="card-header bg-white py-2 px-3 d-flex justify-content-between align-items-center border-0">
              <div className="d-flex align-items-center gap-2">
                <FaBars className="text-muted cursor-grab" />
                <span className="fw-bold small">Item #{index + 1}</span>
              </div>
              <button 
                type="button" 
                className="btn btn-link btn-sm text-danger p-0"
                onClick={() => remove(index)}
              >
                <FaTrash size={12} />
              </button>
            </div>
            
            <div className="card-body p-3 bg-white border-top">
              <div className="row g-3">
                {field.subFields?.map((subField) => (
                  <div 
                    key={subField.id} 
                    className={`col-md-${subField.width || '100'}`}
                  >
                    <ContentFieldRenderer 
                      field={subField} 
                      control={control} 
                      parentName={`${name}.${index}`} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-4 text-muted small bg-white border rounded">
            No items added. Click "Add Row" to start.
          </div>
        )}
      </div>
    </div>
  );
}
