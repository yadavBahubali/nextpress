"use client";

import React from "react";
import { Save, Loader2, Globe } from "lucide-react";

interface SeoHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  showSave: boolean;
}

export default function SeoHeader({ isSaving, onSave, showSave }: SeoHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
            <Globe size={24} />
          </div>
          <h2 className="fw-bold mb-0">Professional SEO Workspace</h2>
        </div>
        <p className="text-muted small mb-0">
          Centrally manage your site structural SEO, crawlers, and structural visibility.
        </p>
      </div>
      
      {showSave && (
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-pill fw-bold shadow-sm"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save All Changes
        </button>
      )}
    </div>
  );
}
