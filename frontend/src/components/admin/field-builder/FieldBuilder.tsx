"use client";

import React from "react";
import FieldCard from "./FieldCard";
import { useBuilderStore } from "@/app/[admin]/blogs/builder/store";
import { FaPlus } from "react-icons/fa";

export default function FieldBuilder() {
  const { currentPage, activeSectionId, addField } = useBuilderStore();
  const section = currentPage.sections.find(s => s.id === activeSectionId);

  if (!section) {
    return (
      <div className="text-center py-5 bg-white rounded border border-dashed mb-4">
        <p className="text-muted">Select a section to begin building fields.</p>
      </div>
    );
  }

  return (
    <div className="field-builder">
      <div className="field-list mb-4">
        {section.fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </div>
      
      {section.fields.length === 0 && (
        <div className="text-center py-5 bg-white rounded border border-dashed mb-4">
          <p className="text-muted">No fields defined in this section. Start building your schema.</p>
        </div>
      )}

      <button 
        onClick={() => addField(section.id)} 
        className="btn btn-outline-primary w-100 border-dashed py-3 fw-bold shadow-sm"
      >
        <FaPlus className="me-2" /> Add Main Field
      </button>
    </div>
  );
}
