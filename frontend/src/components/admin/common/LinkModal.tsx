"use client";

import React, { useState, useEffect } from "react";
import { X, Link as LinkIcon, ExternalLink } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, text?: string, newTab?: boolean) => void;
  initialUrl?: string;
  initialText?: string;
  initialNewTab?: boolean;
}

export default function LinkModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialUrl = "", 
  initialText = "", 
  initialNewTab = false 
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [newTab, setNewTab] = useState(initialNewTab);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
      setNewTab(initialNewTab);
    }
  }, [isOpen, initialUrl, initialText, initialNewTab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url, text, newTab);
    onClose();
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-fade-in" style={{ width: '90%', maxWidth: '450px' }}>
        <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-light">
          <div className="d-flex align-items-center gap-2">
            <LinkIcon size={18} className="text-primary" />
            <h6 className="mb-0 fw-bold">Insert/edit link</h6>
          </div>
          <button className="btn btn-link p-1 text-muted" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">URL</label>
            <input 
              type="text" 
              className="form-control form-control-sm border-solid" 
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Link Text (optional)</label>
            <input 
              type="text" 
              className="form-control form-control-sm border-solid" 
              placeholder="Click here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="openNewTab"
                checked={newTab}
                onChange={(e) => setNewTab(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="openNewTab">
                Open link in a new tab
              </label>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end pt-2">
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4">Add Link</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .border-solid {
          border: 1px solid #dee2e6;
        }
      `}</style>
    </div>
  );
}
