"use client";

import React from "react";
import { useAppSelector } from "@/store";
import { Save, Eye, Send, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminPath } from "@/utils/BaseUrl";

interface Props {
  onSave: (status?: string) => void;
  isSaving: boolean;
}

export default function TopbarActions({ onSave, isSaving }: Props) {
  const { metadata, isDirty } = useAppSelector((state) => state.editor);

  return (
    <div className="bg-white border-bottom py-2 px-4 sticky-top shadow-sm" style={{ zIndex: 1020, top: 0 }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Link 
              href={`/${adminPath}/pages`}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 px-3 rounded-pill"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            
            <div className="vr mx-2 h-25"></div>

            <h5 className="mb-0 fw-bold text-dark">
              Editing: <span className="text-primary">{metadata.title || "Untitled Page"}</span>
            </h5>
            {isDirty && (
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 px-3">
              <Eye size={16} />
              Preview
            </button>
            
            <button 
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3"
              onClick={() => onSave("draft")}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>

            <button 
              className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-4"
              onClick={() => onSave("published")}
              disabled={isSaving}
            >
              <Send size={16} />
              {metadata.status === "published" ? "Update Page" : "Publish Page"}
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
