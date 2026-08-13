"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaImages, FaVideo, FaFileAlt, FaExclamationTriangle } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import toast from "react-hot-toast";

export default function MediaSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, isSaving } = useAppSelector(state => state.settings);

  const [formData, setFormData] = useState({
    media_max_image_size: "5", // MB
    media_max_video_size: "100", // MB
    media_allowed_extensions: "jpg, jpeg, png, gif, webp, svg, mp4, mov, pdf, doc, docx",
    media_auto_resize: "true",
  });

  const keys = Object.keys(formData);

  useEffect(() => {
    dispatch(fetchSettingsGroup(keys));
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      const newFormData: any = { ...formData };
      let hasData = false;
      keys.forEach(key => {
        if (settings[key] !== undefined) {
          newFormData[key] = settings[key];
          hasData = true;
        }
      });
      if (hasData) {
        setFormData(newFormData);
      }
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(saveSettingsGroup({ data: formData, group: "media" })).unwrap();
      toast.success("Media settings saved successfully");
    } catch (error: any) {
      toast.error(error || "Failed to save settings");
    }
  };

  if (isLoading && Object.values(formData).every(v => v === "5" || v === "100" || v === "true" || v === "jpg, jpeg, png, gif, webp, svg, mp4, mov, pdf, doc, docx")) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Media Settings</h2>
          <p className="text-muted">Configure file upload limits and allowed media types.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="alert alert-info d-flex align-items-center gap-3 border-0 shadow-sm mb-4">
        <FaExclamationTriangle className="text-info fs-4" />
        <div>
          <h6 className="mb-1 fw-bold">Note for Administrators</h6>
          <p className="mb-0 small">These settings control frontend validation. Backend server limits (PHP/Node/Nginx) may also need to be adjusted for very large files.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Upload Limits</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Max Image Upload Size (MB)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaImages /></span>
                  <input
                    type="number"
                    name="media_max_image_size"
                    className="form-control border-start-0"
                    value={formData.media_max_image_size}
                    onChange={handleChange}
                    placeholder="5"
                  />
                  <span className="input-group-text">MB</span>
                </div>
                <div className="form-text">Recommended: 2MB to 5MB for optimized performance.</div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Max Video Upload Size (MB)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaVideo /></span>
                  <input
                    type="number"
                    name="media_max_video_size"
                    className="form-control border-start-0"
                    value={formData.media_max_video_size}
                    onChange={handleChange}
                    placeholder="100"
                  />
                  <span className="input-group-text">MB</span>
                </div>
                <div className="form-text">Higher limits may require server-side timeout adjustments.</div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Allowed File Extensions</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaFileAlt /></span>
                  <textarea
                    name="media_allowed_extensions"
                    className="form-control border-start-0"
                    rows={3}
                    value={formData.media_allowed_extensions}
                    onChange={handleChange}
                    placeholder="jpg, png, pdf, etc."
                  ></textarea>
                </div>
                <div className="form-text">Comma-separated list of allowed file types.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Image Optimization</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Auto-resize Large Images</label>
                <select 
                  name="media_auto_resize" 
                  className="form-select"
                  value={formData.media_auto_resize}
                  onChange={handleChange}
                >
                  <option value="true">Enabled (Recommended)</option>
                  <option value="false">Disabled (Keep Original)</option>
                </select>
                <div className="form-text">Automatically scales down extremely large images to save storage and improve load times.</div>
              </div>

              <hr />

              <div className="small text-muted">
                <p className="mb-2 fw-bold text-dark">Default Folder Structure:</p>
                <ul className="ps-3 mb-0">
                  <li>/uploads/images/</li>
                  <li>/uploads/videos/</li>
                  <li>/uploads/docs/</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
