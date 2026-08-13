"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import toast from "react-hot-toast";

export default function CompanySettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, isSaving } = useAppSelector(state => state.settings);

  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    company_map_url: "",
    social_facebook: "",
    social_instagram: "",
    social_linkedin: "",
    social_x: "",
    social_youtube: "",
    social_whatsapp: "",
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
          newFormData[key] = settings[key] === null ? "" : settings[key];
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
      await dispatch(saveSettingsGroup({ data: formData, group: "company" })).unwrap();
      toast.success("Company settings saved successfully");
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
          <h2 className="fw-bold">Company & Social</h2>
          <p className="text-muted">Manage your business contact details and social media profiles.</p>
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
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Business Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Company Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaBuilding /></span>
                  <input
                    type="text"
                    name="company_name"
                    className="form-control border-start-0"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="NextPress Enterprise Pvt Ltd"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Physical Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaMapMarkerAlt /></span>
                  <textarea
                    name="company_address"
                    className="form-control border-start-0"
                    rows={3}
                    value={formData.company_address}
                    onChange={handleChange}
                    placeholder="123 Enterprise Way, Tech City, 10101"
                  ></textarea>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaPhone /></span>
                  <input
                    type="text"
                    name="company_phone"
                    className="form-control border-start-0"
                    value={formData.company_phone}
                    onChange={handleChange}
                    placeholder="+1 (234) 567-890"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Contact Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted"><FaEnvelope /></span>
                  <input
                    type="email"
                    name="company_email"
                    className="form-control border-start-0"
                    value={formData.company_email}
                    onChange={handleChange}
                    placeholder="info@nextpress.com"
                  />
                </div>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Google Maps URL / Embed</label>
                <input
                  type="text"
                  name="company_map_url"
                  className="form-control"
                  value={formData.company_map_url}
                  onChange={handleChange}
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Social Media Profiles</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Facebook URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-primary"><FaFacebook /></span>
                  <input
                    type="text"
                    name="social_facebook"
                    className="form-control border-start-0"
                    value={formData.social_facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/nextpress"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Instagram URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-danger"><FaInstagram /></span>
                  <input
                    type="text"
                    name="social_instagram"
                    className="form-control border-start-0"
                    value={formData.social_instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/nextpress"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">LinkedIn URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-primary"><FaLinkedin /></span>
                  <input
                    type="text"
                    name="social_linkedin"
                    className="form-control border-start-0"
                    value={formData.social_linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/nextpress"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">X (Twitter) URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-dark"><FaTwitter /></span>
                  <input
                    type="text"
                    name="social_x"
                    className="form-control border-start-0"
                    value={formData.social_x}
                    onChange={handleChange}
                    placeholder="https://x.com/nextpress"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">YouTube URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-danger"><FaYoutube /></span>
                  <input
                    type="text"
                    name="social_youtube"
                    className="form-control border-start-0"
                    value={formData.social_youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@nextpress"
                  />
                </div>
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">WhatsApp Number / Link</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-success"><FaWhatsapp /></span>
                  <input
                    type="text"
                    name="social_whatsapp"
                    className="form-control border-start-0"
                    value={formData.social_whatsapp}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
