"use client";

import React from "react";
import { SEO_AVAILABLE_VARIABLES } from "@/utils/seoVariableEngine";
import { Tag } from "lucide-react";

interface SeoVariableToolbarProps {
  onInsert: (tag: string) => void;
}

export default function SeoVariableToolbar({ onInsert }: SeoVariableToolbarProps) {
  return (
    <div className="seo-variable-toolbar d-flex flex-wrap gap-1 mb-2">
      <div className="d-flex align-items-center me-2 text-muted small">
        <Tag size={12} className="me-1" />
        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Variables:</span>
      </div>
      {SEO_AVAILABLE_VARIABLES.map((v) => (
        <button
          key={v.tag}
          type="button"
          className="btn btn-xs btn-light border py-0 px-2 small text-muted hover-primary"
          style={{ fontSize: '0.7rem', borderRadius: '4px' }}
          onClick={() => onInsert(v.tag)}
          title={v.description}
        >
          {v.tag}
        </button>
      ))}
      
      <style jsx>{`
        .hover-primary:hover {
          color: var(--bs-primary) !important;
          border-color: var(--bs-primary) !important;
          background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
        }
        .btn-xs {
          padding: 1px 5px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
