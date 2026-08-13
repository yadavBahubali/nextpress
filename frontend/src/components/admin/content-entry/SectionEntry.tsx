"use client";

import React from "react";
import { useForm } from "react-hook-form";
import ContentFieldRenderer from "./ContentFieldRenderer";
import { Section } from "@/app/[admin]/blogs/builder/store";

interface SectionEntryProps {
  section: Section;
  onSave: (data: any) => void;
}

export default function SectionEntry({ section, onSave }: SectionEntryProps) {
  const { control, handleSubmit } = useForm();

  const handleSave = (data: any) => {
    console.log(`Saving data for section ${section.type}:`, data);
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="section-entry card border-0 shadow-sm mb-4 overflow-hidden border-top border-primary border-4">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0 text-dark">{section.name}</h6>
          <small className="text-muted font-monospace" style={{ fontSize: '10px' }}>LAYOUT: {section.type}</small>
        </div>
        <button type="submit" className="btn btn-sm btn-primary px-3 shadow-sm">
          Save Layout Content
        </button>
      </div>
      <div className="card-body p-4 bg-light bg-opacity-10">
        <div className="row g-3">
          {section.fields.map(field => (
            <div key={field.id} className={`col-md-${field.width || '100'}`}>
              <ContentFieldRenderer field={field} control={control} />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
