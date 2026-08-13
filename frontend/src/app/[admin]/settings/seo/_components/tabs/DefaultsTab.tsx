"use client";

import React from "react";
import { 
  Settings, 
  Image as ImageIcon, 
  Layout, 
  HelpCircle,
  Hash,
  AlertCircle
} from "lucide-react";
import { SeoMeta } from "@/services/seo.service";

interface DefaultsTabProps {
  globalSeo: Partial<SeoMeta>;
  setGlobalSeo: (data: Partial<SeoMeta>) => void;
  onSelectMedia: () => void;
}

export default function DefaultsTab({ globalSeo, setGlobalSeo, onSelectMedia }: DefaultsTabProps) {
  return (
    <div className="defaults-tab">
      <div className="row g-4">
        {/* Left Column - General Settings */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-4">
              <Settings size={18} className="text-primary" />
              Site Identity Templates
            </h6>
            
            <div className="mb-4">
              <label className="form-label fw-bold small text-uppercase text-muted">Title Template</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control form-control-lg border-end-0 shadow-none"
                  placeholder="e.g. %title% %sep% %sitename%"
                  value={globalSeo.meta_title || ""}
                  onChange={(e) => setGlobalSeo({...globalSeo, meta_title: e.target.value})}
                />
                <span className="input-group-text bg-white border-start-0">
                  <HelpCircle size={16} className="text-muted" />
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {['%title%', '%sitename%', '%sep%', '%tagline%'].map(tag => (
                  <button 
                    key={tag} 
                    className="btn btn-sm btn-light border py-0 px-2 x-small rounded-pill text-primary fw-medium"
                    onClick={() => setGlobalSeo({...globalSeo, meta_title: (globalSeo.meta_title || "") + " " + tag})}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-0">
              <label className="form-label fw-bold small text-uppercase text-muted">Fallback Description</label>
              <textarea 
                className="form-control border shadow-none"
                rows={4}
                placeholder="Used when a page has no meta description..."
                value={globalSeo.meta_description || ""}
                onChange={(e) => setGlobalSeo({...globalSeo, meta_description: e.target.value})}
              />
              <p className="x-small text-muted mt-2 mb-0">
                Recommended length: 150-160 characters.
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-4">
              <Layout size={18} className="text-primary" />
              Structural Metadata
            </h6>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted">Global Schema Type</label>
                <select 
                  className="form-select shadow-none"
                  value={globalSeo.schema_type || "Organization"}
                  onChange={(e) => setGlobalSeo({...globalSeo, schema_type: e.target.value})}
                >
                  <option value="Organization">Organization</option>
                  <option value="LocalBusiness">Local Business</option>
                  <option value="WebSite">WebSite</option>
                  <option value="Person">Person</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted">Separator Character</label>
                <select 
                  className="form-select shadow-none"
                  value={globalSeo.title_separator || "-"}
                  onChange={(e) => setGlobalSeo({...globalSeo, title_separator: e.target.value})}
                >
                  <option value="-">- Dash</option>
                  <option value="|">| Pipe</option>
                  <option value="•">• Dot</option>
                  <option value="~">~ Tilde</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Social & Guidance */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-4">
              <ImageIcon size={18} className="text-primary" />
              Default Social Sharing
            </h6>
            
            <div 
              className="border-2 border-dashed rounded-4 p-5 text-center bg-light cursor-pointer hover-bg-light transition-all mb-3"
              onClick={onSelectMedia}
            >
              {globalSeo.og_image ? (
                <img src={globalSeo.og_image} alt="OG" className="img-fluid rounded shadow-sm mb-3" style={{ maxHeight: '120px' }} />
              ) : (
                <ImageIcon size={40} className="text-muted opacity-25 mb-3" />
              )}
              <div className="fw-bold text-muted small">{globalSeo.og_image ? "Change Global Image" : "Upload Default OG Image"}</div>
              <p className="x-small text-muted mt-1 mb-0">Recommended: 1200 x 630 px</p>
            </div>
          </div>

          <div className="alert alert-warning border-0 rounded-4 p-4 shadow-sm d-flex gap-3">
            <AlertCircle size={24} className="text-warning flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-1 small">Inheritance Rule</h6>
              <p className="small mb-0 opacity-75">
                These settings are used as <strong>absolute fallbacks</strong>. Page-level SEO settings will always take precedence over global defaults.
              </p>
            </div>
          </div>

          <div className="card border-0 bg-primary bg-opacity-10 rounded-4 p-4">
            <h6 className="fw-bold d-flex align-items-center gap-2 text-primary mb-3">
              <Hash size={18} />
              Variable Reference
            </h6>
            <div className="d-grid gap-2">
              <div className="d-flex justify-content-between x-small border-bottom border-primary border-opacity-10 pb-2">
                <span className="fw-bold">%title%</span>
                <span className="text-muted">The page/post title</span>
              </div>
              <div className="d-flex justify-content-between x-small border-bottom border-primary border-opacity-10 pb-2">
                <span className="fw-bold">%sitename%</span>
                <span className="text-muted">From General Settings</span>
              </div>
              <div className="d-flex justify-content-between x-small">
                <span className="fw-bold">%tagline%</span>
                <span className="text-muted">Site tagline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.75rem; }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
}
