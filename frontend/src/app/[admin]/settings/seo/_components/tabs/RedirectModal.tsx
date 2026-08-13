"use client";

import React, { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { seoService } from "@/services/seo.service";
import toast from "react-hot-toast";

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RedirectModal({ isOpen, onClose, onSuccess }: RedirectModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    source_path: '',
    redirect_url: '',
    redirect_type: 301
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source_path || !formData.redirect_url) {
      toast.error("Both paths are required");
      return;
    }

    // Ensure paths start with /
    const source = formData.source_path.startsWith('/') ? formData.source_path : `/${formData.source_path}`;
    
    setIsSaving(true);
    try {
      await seoService.upsertSeo('redirect', null, {
        ...formData,
        source_path: source,
        entity_type: 'redirect',
        entity_id: null
      });
      toast.success("Redirect added successfully");
      onSuccess();
      onClose();
      setFormData({ source_path: '', redirect_url: '', redirect_type: 301 });
    } catch (error) {
      toast.error("Failed to add redirect. Path might already exist.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content shadow-lg border-0 rounded-4 bg-white">
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold">Add New Redirect</h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-muted mb-2">Original Path (Source)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">/</span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0 shadow-none bg-light bg-opacity-25" 
                    placeholder="old-page-url" 
                    value={formData.source_path.replace(/^\//, '')}
                    onChange={(e) => setFormData({...formData, source_path: e.target.value})}
                    required
                  />
                </div>
                <div className="form-text small mt-2">Users visiting this path will be redirected.</div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-muted mb-2">Target Path / URL</label>
                <input 
                  type="text" 
                  className="form-control shadow-none bg-light bg-opacity-25" 
                  placeholder="/new-destination or https://..." 
                  value={formData.redirect_url}
                  onChange={(e) => setFormData({...formData, redirect_url: e.target.value})}
                  required
                />
                <div className="form-text small mt-2">Where the user should be sent.</div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-uppercase text-muted mb-2">Redirect Type</label>
                <select 
                  className="form-select shadow-none bg-light bg-opacity-25"
                  value={formData.redirect_type}
                  onChange={(e) => setFormData({...formData, redirect_type: parseInt(e.target.value)})}
                >
                  <option value={301}>301 (Permanent)</option>
                  <option value={302}>302 (Temporary)</option>
                  <option value={307}>307 (Temporary Redirect)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-top-0 p-4 pt-0 gap-2">
              <button type="button" className="btn btn-light px-4 rounded-pill fw-medium" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm" disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Add Redirect
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
