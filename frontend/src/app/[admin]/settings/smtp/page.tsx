"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaPaperPlane, FaLock, FaServer, FaUser, FaKey } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import toast from "react-hot-toast";

export default function SmtpSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, isSaving } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: "465",
    smtp_user: "",
    smtp_password: "",
    smtp_encryption: "ssl",
    smtp_from_name: "NextPress Admin",
    smtp_from_email: "",
  });

  const keys = Object.keys(formData);

  useEffect(() => {
    dispatch(fetchSettingsGroup(keys)).unwrap().then((data) => {
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data
        }));
      }
    });
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveSettingsGroup({ data: formData, group: "smtp" }))
      .unwrap()
      .then(() => toast.success("SMTP settings saved successfully"))
      .catch((err) => toast.error(err || "Failed to save settings"));
  };

  const testConnection = () => {
    toast.error("SMTP test functionality will be available after backend implementation.");
  };

  if (isLoading && !Object.values(settings).length) {
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
          <h2 className="fw-bold">SMTP Configuration</h2>
          <p className="text-muted">Configure your outgoing email server settings.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={testConnection}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
          >
            <FaPaperPlane /> Test Connection
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Mail Server Details</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">SMTP Host</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><FaServer /></span>
                    <input
                      type="text"
                      name="smtp_host"
                      className="form-control border-start-0"
                      value={formData.smtp_host}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com or mail.yourdomain.com"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">SMTP Port</label>
                  <input
                    type="text"
                    name="smtp_port"
                    className="form-control"
                    value={formData.smtp_port}
                    onChange={handleChange}
                    placeholder="465"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">SMTP Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><FaUser /></span>
                    <input
                      type="text"
                      name="smtp_user"
                      className="form-control border-start-0"
                      value={formData.smtp_user}
                      onChange={handleChange}
                      placeholder="your-email@domain.com"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">SMTP Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><FaKey /></span>
                    <input
                      type="password"
                      name="smtp_password"
                      className="form-control border-start-0"
                      value={formData.smtp_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Encryption</label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="smtp_encryption" 
                      id="enc_ssl" 
                      value="ssl"
                      checked={formData.smtp_encryption === "ssl"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="enc_ssl">SSL (Port 465)</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="smtp_encryption" 
                      id="enc_tls" 
                      value="tls"
                      checked={formData.smtp_encryption === "tls"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="enc_tls">TLS (Port 587)</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="smtp_encryption" 
                      id="enc_none" 
                      value="none"
                      checked={formData.smtp_encryption === "none"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="enc_none">None</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Sender Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">From Name</label>
                  <input
                    type="text"
                    name="smtp_from_name"
                    className="form-control"
                    value={formData.smtp_from_name}
                    onChange={handleChange}
                    placeholder="NextPress Support"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">From Email Address</label>
                  <input
                    type="email"
                    name="smtp_from_email"
                    className="form-control"
                    value={formData.smtp_from_email}
                    onChange={handleChange}
                    placeholder="no-reply@nextpress.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-primary text-white mb-4">
            <div className="card-body">
              <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
                <FaLock /> Why SMTP?
              </h5>
              <p className="small mb-0">
                By default, servers use the PHP mail() function which often results in emails being marked as spam. SMTP ensures your emails (orders, resets, contact forms) are delivered reliably via an authenticated provider like SendGrid, Mailgun, or Gmail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
