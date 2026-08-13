"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaImage, FaTimes } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import toast from "react-hot-toast";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";
import Image from "next/image";

export default function GeneralSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, isSaving } = useAppSelector(state => state.settings);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    site_title: "",
    site_tagline: "",
    site_email: "",
    site_logo: "",
    site_logo_white: "",
    site_favicon: "",
    site_domain: "https://",
    global_seo_title: "",
    global_seo_description: "",
    global_seo_image: "",
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
        if (settings[key] !== undefined && settings[key] !== null) {
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
      await dispatch(saveSettingsGroup({ data: formData, group: "general" })).unwrap();
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error || "Failed to save settings");
    }
  };

  const openMediaModal = (fieldName: string) => {
    setActiveImageField(fieldName);
    setIsMediaModalOpen(true);
  };

  const handleImageSelect = (media: any) => {
    if (activeImageField && media.url) {
      setFormData(prev => ({ ...prev, [activeImageField]: media.url }));
      toast.success("Image selected");
    }
    setIsMediaModalOpen(false);
    setActiveImageField(null);
  };

  const removeImage = (fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: "" }));
  };

  // Helper to check if URL is valid for Image component
  const isValidUrl = (url: string) => {
    return url && typeof url === 'string' && url.startsWith('http');
  };

  if (isLoading && Object.values(formData).every(v => v === "" || v === "https://")) {
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
          <h2 className="fw-bold">General Settings</h2>
          <p className="text-muted">Configure your website's basic identity and global SEO.</p>
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
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Site Identity</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Site Title</label>
                <input
                  type="text"
                  name="site_title"
                  className="form-control"
                  value={formData.site_title || ""}
                  onChange={handleChange}
                  placeholder="e.g. NextPress Enterprise"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tagline</label>
                <input
                  type="text"
                  name="site_tagline"
                  className="form-control"
                  value={formData.site_tagline || ""}
                  onChange={handleChange}
                  placeholder="e.g. Premium Enterprise Solutions"
                />
              </div>
              <div className="mb-0">
                <label className="form-label fw-semibold">Admin Email</label>
                <input
                  type="email"
                  name="site_email"
                  className="form-control"
                  value={formData.site_email || ""}
                  onChange={handleChange}
                  placeholder="admin@nextpress.com"
                />
                <div className="form-text">This address is used for admin purposes.</div>
              </div>
              <div className="mb-0 mt-3">
                <label className="form-label fw-semibold">Site Domain (Primary URL)</label>
                <input
                  type="text"
                  name="site_domain"
                  className="form-control"
                  value={formData.site_domain || ""}
                  onChange={handleChange}
                  placeholder="https://yourdomain.com"
                />
                <div className="form-text">Used for SEO previews and canonical URLs. Include <code>https://</code></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Logos & Favicon</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold d-block">Main Logo</label>
                <div className="mb-2 border rounded p-2 text-center bg-light" style={{ minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isValidUrl(formData.site_logo) ? (
                    <div className="position-relative">
                      <Image src={formData.site_logo} alt="Logo" width={150} height={50} className="object-fit-contain" unoptimized />
                      <button 
                        type="button"
                        onClick={() => removeImage("site_logo")}
                        className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted small">No logo selected</span>
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => openMediaModal("site_logo")}
                >
                  Change Logo
                </button>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold d-block">White Logo (Dark BG)</label>
                <div className="mb-2 border rounded p-2 text-center bg-dark" style={{ minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isValidUrl(formData.site_logo_white) ? (
                    <div className="position-relative">
                      <Image src={formData.site_logo_white} alt="White Logo" width={150} height={50} className="object-fit-contain" unoptimized />
                      <button 
                        type="button"
                        onClick={() => removeImage("site_logo_white")}
                        className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-white-50 small">No logo selected</span>
                  )}
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => openMediaModal("site_logo_white")}
                >
                  Change White Logo
                </button>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold d-block">Favicon</label>
                <div className="d-flex align-items-center gap-3">
                  {isValidUrl(formData.site_favicon) ? (
                    <div className="position-relative">
                      <Image src={formData.site_favicon} alt="Favicon" width={32} height={32} unoptimized />
                      <button 
                        type="button"
                        onClick={() => removeImage("site_favicon")}
                        className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle rounded-circle p-0"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <FaTimes size={8} />
                      </button>
                    </div>
                  ) : (
                    <div className="border rounded bg-light" style={{ width: "32px", height: "32px" }}></div>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => openMediaModal("site_favicon")}
                  >
                    Select Favicon
                  </button>
                </div>
                <div className="form-text small">Recommended: 32x32 or 48x48 PNG/ICO.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
