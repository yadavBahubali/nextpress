"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaGoogle, FaFacebook, FaCode } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import toast from "react-hot-toast";

export default function IntegrationsSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, isSaving } = useAppSelector(state => state.settings);

  const [formData, setFormData] = useState({
    integ_ga4_id: "",
    integ_gtm_id: "",
    integ_pixel_id: "",
    integ_custom_head: "",
    integ_custom_body: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(saveSettingsGroup({ data: formData, group: "integrations" })).unwrap();
      toast.success("Integration settings saved successfully");
    } catch (error: any) {
      toast.error(error || "Failed to save settings");
    }
  };

  if (isLoading && Object.values(formData).every(v => v === "")) {
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
          <h2 className="fw-bold">Integrations</h2>
          <p className="text-muted">Manage third-party tracking codes and custom scripts.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaGoogle className="text-primary" /> Analytics & Tracking
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Google Analytics 4 (GA4) ID</label>
                <input
                  type="text"
                  name="integ_ga4_id"
                  className="form-control"
                  value={formData.integ_ga4_id}
                  onChange={handleChange}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Google Tag Manager (GTM) ID</label>
                <input
                  type="text"
                  name="integ_gtm_id"
                  className="form-control"
                  value={formData.integ_gtm_id}
                  onChange={handleChange}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Facebook Pixel ID</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-primary"><FaFacebook /></span>
                  <input
                    type="text"
                    name="integ_pixel_id"
                    className="form-control border-start-0"
                    value={formData.integ_pixel_id}
                    onChange={handleChange}
                    placeholder="123456789012345"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm mb-4 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaCode className="text-secondary" /> Custom Scripts
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Header Scripts</label>
                <textarea
                  name="integ_custom_head"
                  className="form-control font-monospace"
                  style={{ fontSize: "0.85rem" }}
                  rows={5}
                  value={formData.integ_custom_head}
                  onChange={handleChange}
                  placeholder="<!-- Custom scripts to be placed in the <head> section -->"
                ></textarea>
                <div className="form-text small">Use this to add verification tags, custom CSS, or third-party fonts.</div>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Footer Scripts</label>
                <textarea
                  name="integ_custom_body"
                  className="form-control font-monospace"
                  style={{ fontSize: "0.85rem" }}
                  rows={5}
                  value={formData.integ_custom_body}
                  onChange={handleChange}
                  placeholder="<!-- Custom scripts to be placed before the </body> tag -->"
                ></textarea>
                <div className="form-text small">Perfect for chat widgets, tracking pixels, or custom JS.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
