"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaPenNib,FaGlobe,FaCampground } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import { fetchCategories } from "@/store/slices/blogSlice";
import toast from "react-hot-toast";

export default function WritingSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading: settingsLoading, isSaving } = useAppSelector((state) => state.settings);
  const { categories } = useAppSelector((state) => state.blogs);

  const [formData, setFormData] = useState({
    writing_default_category: "",
    writing_default_status: "draft",
    blog_prefix: "blog",
  });

  const keys = Object.keys(formData);

  useEffect(() => {
    dispatch(fetchSettingsGroup(keys)).unwrap().then((data) => {
      if (data) {
        // Sanitize: replace null/undefined values with empty string to avoid
        // React warning about null `value` prop on controlled <select>
        const sanitized = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v ?? ""])
        );
        setFormData(prev => ({ ...prev, ...sanitized }));
      }
    });
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveSettingsGroup({ data: formData, group: "writing" }))
      .unwrap()
      .then(() => toast.success("Writing settings saved successfully"))
      .catch((err) => toast.error(err || "Failed to save settings"));
  };

  if (settingsLoading && !Object.values(settings).length) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Writing Settings</h2>
          <p className="text-muted small">Configure content creation and enterprise routing defaults.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
        >
          {isSaving ? <FaCampground size={16} className="animate-spin" /> : <FaSave />} {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          {/* DEFAULTS */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <FaPenNib className="text-primary" /> Editorial Defaults
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-muted">Default Post Category</label>
                <select 
                  name="writing_default_category" 
                  className="form-select bg-light border-0 shadow-none"
                  value={formData.writing_default_category}
                  onChange={handleChange}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="form-text x-small mt-2 text-muted">New blog posts will be assigned to this category by default.</div>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-bold text-uppercase text-muted">Default Publication Status</label>
                <div className="d-flex gap-4 mt-2">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="writing_default_status" 
                      id="status_draft" 
                      value="draft"
                      checked={formData.writing_default_status === "draft"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label small fw-medium" htmlFor="status_draft">Draft</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="writing_default_status" 
                      id="status_published" 
                      value="published"
                      checked={formData.writing_default_status === "published"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label small fw-medium" htmlFor="status_published">Published</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PERMALINKS */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                <FaGlobe className="text-primary" size={18} /> Enterprise Permalink Structure
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="mb-0">
                <label className="form-label small fw-bold text-uppercase text-muted">Blog Root Prefix</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-muted font-monospace x-small">/</span>
                  <input 
                    type="text" 
                    name="blog_prefix"
                    className="form-control bg-light border-0 shadow-none font-monospace fw-bold text-primary" 
                    value={formData.blog_prefix}
                    onChange={handleChange}
                    placeholder="blog"
                  />
                  <span className="input-group-text bg-light border-0 text-muted font-monospace x-small">/post-slug</span>
                </div>
                <div className="form-text x-small mt-3 bg-primary bg-opacity-5 p-3 rounded-3 border border-primary border-opacity-10 text-white">
                  <strong>Flexible Path:</strong> Changing this value (e.g. to "insights" or "stories") will instantly update the public URL structure for all your blog posts.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
           <div className="alert alert-info border-0 rounded-4 shadow-sm p-4 bg-primary bg-opacity-10 text-primary">
              <h6 className="fw-bold mb-2">Content Strategy Tip</h6>
              <p className="small mb-0 opacity-75">
                The Blog Prefix is a powerful SEO tool. Choose a prefix that matches your brand's voice. 
                "Insights" is great for B2B, while "News" or "Blog" is standard for general audiences.
              </p>
           </div>
        </div>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
