"use client";

import React from "react";
import { ChevronRight, ChevronDown, Type, Image as ImageIcon, FileText, Layout, Map } from "lucide-react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
  index: number;
}

export default function ACFFieldRow({ field, index }: Props) {
  const { toggleField, updateField } = useACFStore();
  
  const getIcon = (type: string) => {
    switch (type) {
      case "text": return <Type size={16} />;
      case "image": return <ImageIcon size={16} />;
      case "wysiwyg": return <FileText size={16} />;
      case "tab": return <Layout size={16} />;
      case "google_map": return <Map size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <>
      <tr className={`wp-table-row ${field.open ? "open" : ""}`}>
        <td className="wp-table-cell wp-row-index">
          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={() => toggleField(field.id)}
              className="p-0 border-0 bg-transparent text-muted"
            >
              {field.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {index + 1}
          </div>
        </td>
        <td className="wp-table-cell">
          <button 
            onClick={() => toggleField(field.id)}
            className="wp-field-label border-0 bg-transparent p-0"
          >
            {field.label || "(no label)"}
          </button>
        </td>
        <td className="wp-table-cell">
          <span className="wp-field-name">{field.name || "—"}</span>
        </td>
        <td className="wp-table-cell">
          <div className="wp-field-type">
            {getIcon(field.type)}
            {field.type}
          </div>
        </td>
      </tr>
      
      {field.open && (
        <tr>
          <td colSpan={4} className="p-0">
            <div className="wp-field-settings">
              <div className="row">
                <div className="col-md-6">
                  <div className="wp-form-group">
                    <label className="wp-form-label">Field Label</label>
                    <input 
                      type="text" 
                      className="wp-form-control" 
                      value={field.label}
                      onChange={(e) => updateField(field.id, "label", e.target.value)}
                    />
                  </div>
                  
                  <div className="wp-form-group">
                    <label className="wp-form-label">Field Name</label>
                    <input 
                      type="text" 
                      className="wp-form-control" 
                      value={field.name}
                      onChange={(e) => updateField(field.id, "name", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="wp-form-group">
                    <label className="wp-form-label">Field Type</label>
                    <select 
                      className="wp-form-select"
                      value={field.type}
                      onChange={(e) => updateField(field.id, "type", e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="image">Image</option>
                      <option value="wysiwyg">Wysiwyg Editor</option>
                      <option value="tab">Tab</option>
                      <option value="repeater">Repeater</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
