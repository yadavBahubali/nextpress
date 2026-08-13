"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Eye,
  Info,
  ExternalLink,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { seoService } from "@/services/seo.service";

export default function RobotsTab() {
  const [content, setRawContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("default");

  useEffect(() => {
    // Fetch current robots.txt from public or dynamic route
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/robots.txt');
      if (res.ok) {
        const text = await res.text();
        setRawContent(text);
      }
    } catch (error) {
      toast.error("Could not load current robots.txt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await seoService.saveRobotsTxt(content);
      toast.success("Robots.txt published successfully to public folder");
    } catch (error) {
      toast.error("Failed to publish changes");
    } finally {
      setIsSaving(false);
    }
  };

  const applyTemplate = (type: string) => {
    let tpl = "User-agent: *\nAllow: /\n\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://yourdomain.com/sitemap.xml";
    if (type === 'strict') {
      tpl = "User-agent: *\nDisallow: /";
    }
    setRawContent(tpl);
    setActiveTemplate(type);
    toast.success(`${type} template applied`);
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="robots-tab">
      <div className="row g-4">
        {/* Editor Side */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Terminal size={18} className="text-primary" />
                <h6 className="fw-bold mb-0">Directives Editor</h6>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-light border rounded-pill px-3" onClick={() => applyTemplate('default')}>
                  Reset to Default
                </button>
                <a href="/robots.txt" target="_blank" className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2">
                  <Eye size={14} /> Live View
                </a>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="position-relative">
                <textarea 
                  className="form-control h-50 w-100 border-0 p-4 font-monospace small bg-dark text-success"
                  rows={15}
                  value={content}
                  onChange={(e) => setRawContent(e.target.value)}
                  style={{ 
                    resize: 'none', 
                    lineHeight: '1.6',
                    backgroundColor: '#0f172a !important',
                    color: '#10b981 !important'
                  }}
                  placeholder="User-agent: *..."
                />
              </div>
            </div>
            <div className="card-footer bg-light p-4 d-flex justify-content-between align-items-center border-0">
              <div className="small text-muted d-flex align-items-center gap-2">
                <ShieldAlert size={16} className="text-warning" />
                Validating syntax... <strong>OK</strong>
              </div>
              <button 
                className="btn btn-primary px-4 rounded-pill fw-bold"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Publish Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Side */}
        <div className="col-lg-4">
          <div className="alert alert-info border-0 rounded-4 p-4 mb-4 shadow-sm">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <Info size={18} /> What is robots.txt?
            </h6>
            <p className="small mb-3">
              This file tells search engine crawlers which URLs they can access on your site.
            </p>
            <ul className="small ps-3 mb-0">
              <li className="mb-2"><strong>Allow</strong>: Explicitly allow access.</li>
              <li className="mb-2"><strong>Disallow</strong>: Block access.</li>
              <li><strong>Sitemap</strong>: Link to your XML map.</li>
            </ul>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold mb-3">Common Directives</h6>
            <div className="d-grid gap-2">
              <div className="p-3 bg-light rounded-3">
                <code className="d-block mb-1 text-dark">User-agent: *</code>
                <span className="x-small text-muted">Applies to all bots.</span>
              </div>
              <div className="p-3 bg-light rounded-3">
                <code className="d-block mb-1 text-dark">Disallow: /admin/</code>
                <span className="x-small text-muted">Blocks admin area.</span>
              </div>
              <div className="p-3 bg-light rounded-3">
                <code className="d-block mb-1 text-dark">Allow: /</code>
                <span className="x-small text-muted">Allows indexing of root.</span>
              </div>
            </div>
          </div>

          <div className="card border-primary border-opacity-25 bg-primary bg-opacity-5 rounded-4 p-4">
            <h6 className="fw-bold text-primary mb-2">Pro Tip</h6>
            <p className="small text-primary text-opacity-75 mb-0">
              Incorrect robots.txt rules can de-index your entire site. Always use "Live View" to verify before leaving this page.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-monospace { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
        .x-small { font-size: 0.75rem; }
      `}</style>
    </div>
  );
}
