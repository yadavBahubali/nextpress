"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { FieldSchema } from "@/app/[admin]/blogs/builder/store";
import RepeaterInput from "./RepeaterInput";
import { FaInfoCircle, FaImage, FaLink, FaCalendarAlt } from "react-icons/fa";

interface ContentFieldRendererProps {
  field: FieldSchema;
  control: Control<any>;
  parentName?: string; // e.g., "hero" or "hero.cards.0"
}

export default function ContentFieldRenderer({ field, control, parentName }: ContentFieldRendererProps) {
  const fieldName = parentName ? `${parentName}.${field.name}` : field.name;

  const renderInput = (value: any, onChange: (val: any) => void) => {
    switch (field.type) {
      case 'textarea':
        return <textarea className="form-control" rows={4} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={field.options.placeholder} />;
      
      case 'image':
        return (
          <div className="image-input-wrapper">
            <div className="d-flex gap-3 align-items-center mb-2">
              <div className="image-preview border rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                {value ? <img src={value} className="img-fluid" alt="Preview" /> : <FaImage className="text-muted fs-3" />}
              </div>
              <div className="flex-grow-1">
                <input type="text" className="form-control form-control-sm mb-2" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="Image URL..." />
                <button type="button" className="btn btn-sm btn-outline-primary">Browse Library</button>
              </div>
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
            <label className="form-check-label small text-muted">{value ? "True" : "False"}</label>
          </div>
        );

      case 'repeater':
        return <RepeaterInput field={field} control={control} name={fieldName} />;

      case 'select':
        const choices = (field.options.choices || "").split('\n').filter(Boolean).map((line: string) => {
          const [val, label] = line.split(':').map((s: string) => s.trim());
          return { value: val, label: label || val };
        });
        return (
          <select className="form-select" value={value || ""} onChange={e => onChange(e.target.value)}>
            <option value="">Select an option...</option>
            {choices.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        );

      default:
        return <input type={field.type} className="form-control" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={field.options.placeholder} />;
    }
  };

  // For structural grouping like Tabs/Accordion (visual only)
  if (field.type === 'tabs' || field.type === 'accordion') {
    return (
      <div className={`structural-group mb-4 border rounded p-4 bg-white shadow-xs`}>
        <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
          <span className="fw-bold text-dark">{field.label}</span>
          <FaInfoCircle className="text-muted small" />
        </div>
        <div className="row g-3">
          {field.subFields?.map(sf => (
            <div key={sf.id} className={`col-md-${sf.width || '100'}`}>
              <ContentFieldRenderer field={sf} control={control} parentName={parentName} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="content-field-wrapper mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label small fw-bold text-dark mb-0">
          {field.label}
          {field.required && <span className="text-danger ms-1">*</span>}
        </label>
        {field.options.helpText && <FaInfoCircle className="text-muted cursor-help" title={field.options.helpText} />}
      </div>
      
      <Controller
        name={fieldName}
        control={control}
        defaultValue={field.options.defaultValue || ""}
        rules={{ required: field.required }}
        render={({ field: { value, onChange } }) => renderInput(value, onChange)}
      />
    </div>
  );
}
