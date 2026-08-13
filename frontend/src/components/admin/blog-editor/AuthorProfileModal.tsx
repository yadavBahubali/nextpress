"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, FileText, Globe, Save, Loader2, Link as LinkIcon } from "lucide-react";
import { settingsService, AuthorMeta } from "@/services/settings.service";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  authorId: number | string;
  authorName: string;
  authorEmail: string;
  onSave?: (data: AuthorMeta) => void;
}

export default function AuthorProfileModal({ 
  isOpen, 
  onClose, 
  authorId, 
  authorName, 
  authorEmail,
  onSave 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuthorMeta>({
    name: authorName,
    email: authorEmail,
    bio: "",
    details: "",
    social_links: {
      twitter: "",
      linkedin: "",
      website: ""
    }
  });

  useEffect(() => {
    if (isOpen && authorId) {
      const fetchMeta = async () => {
        try {
          const res = await settingsService.getAuthorMeta(authorId);
          if (res.success && res.data) {
            setData({
              ...res.data,
              name: res.data.name || authorName,
              email: res.data.email || authorEmail,
              social_links: res.data.social_links || { twitter: "", linkedin: "", website: "" }
            });
          } else {
            // Reset to defaults if no meta found
            setData({
              name: authorName,
              email: authorEmail,
              bio: "",
              details: "",
              social_links: { twitter: "", linkedin: "", website: "" }
            });
          }
        } catch (error) {
          console.error("Error fetching author meta:", error);
        }
      };
      fetchMeta();
    }
  }, [isOpen, authorId, authorName, authorEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await settingsService.updateAuthorMeta(authorId, data);
      if (res.success) {
        toast.success("Author profile updated");
        if (onSave) onSave(data);
        onClose();
      }
    } catch (error) {
      toast.error("Failed to update author profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-slide-up" style={{ width: '90%', maxWidth: '550px' }}>
        <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-light">
          <div className="d-flex align-items-center gap-2">
            <User size={18} className="text-primary" />
            <h6 className="mb-0 fw-bold">Author Profile: {authorName}</h6>
          </div>
          <button className="btn btn-link p-1 text-muted" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Display Name</label>
              <div className="input-group input-group-sm border rounded overflow-hidden">
                <span className="input-group-text bg-light border-0"><User size={14} /></span>
                <input 
                  type="text" 
                  className="form-control border-0" 
                  value={data.name}
                  onChange={(e) => setData({...data, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Public Email</label>
              <div className="input-group input-group-sm border rounded overflow-hidden">
                <span className="input-group-text bg-light border-0"><Mail size={14} /></span>
                <input 
                  type="email" 
                  className="form-control border-0" 
                  value={data.email}
                  onChange={(e) => setData({...data, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label x-small fw-bold text-muted text-uppercase mb-1">Short Bio</label>
              <textarea 
                className="form-control form-control-sm border shadow-none" 
                rows={3}
                placeholder="A brief introduction..."
                value={data.bio}
                onChange={(e) => setData({...data, bio: e.target.value})}
              />
            </div>

            <div className="col-12 mt-4">
              <h6 className="x-small fw-bold text-uppercase text-primary mb-3">Social & Web Links</h6>
              <div className="d-flex flex-column gap-2">
                <div className="input-group input-group-sm border rounded overflow-hidden">
                  <span className="input-group-text bg-light border-0" style={{ width: '40px' }}><LinkIcon size={14} /></span>
                  <input 
                    type="url" 
                    className="form-control border-0" 
                    placeholder="Website URL"
                    value={data.social_links?.website}
                    onChange={(e) => setData({...data, social_links: { ...data.social_links, website: e.target.value }})}
                  />
                </div>
                <div className="input-group input-group-sm border rounded overflow-hidden">
                  <span className="input-group-text bg-light border-0" style={{ width: '40px' }}>TW</span>
                  <input 
                    type="text" 
                    className="form-control border-0" 
                    placeholder="Twitter Username"
                    value={data.social_links?.twitter}
                    onChange={(e) => setData({...data, social_links: { ...data.social_links, twitter: e.target.value }})}
                  />
                </div>
                <div className="input-group input-group-sm border rounded overflow-hidden">
                  <span className="input-group-text bg-light border-0" style={{ width: '40px' }}>LI</span>
                  <input 
                    type="text" 
                    className="form-control border-0" 
                    placeholder="LinkedIn Profile"
                    value={data.social_links?.linkedin}
                    onChange={(e) => setData({...data, social_links: { ...data.social_links, linkedin: e.target.value }})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end pt-4 mt-4 border-top">
            <button type="button" className="btn btn-sm btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-sm btn-primary rounded-pill px-5 fw-bold d-flex align-items-center gap-2" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
