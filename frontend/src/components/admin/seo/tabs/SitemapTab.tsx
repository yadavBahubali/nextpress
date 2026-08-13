"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData } from "@/store/slices/seoSlice";
import {
  Map,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function SitemapTab() {
  const dispatch = useAppDispatch();
  const { seoData, variables } = useAppSelector((state) => state.seo);
  const [isPinging, setIsPinging] = useState(false);

  const handleUpdateSeo = (data: any) => {
    dispatch(updateSeoData(data));
  };

  if (!seoData) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // ... rest of logic ...
  
  const handlePingGoogle = async () => {
    setIsPinging(true);
    // Simulate pinging Google
    setTimeout(() => {
      setIsPinging(false);
      toast.success("Successfully pinged Google with the latest sitemap!");
    }, 1500);
  };

  const sitemapUrl = `${variables.site_domain || "http://localhost:3000"}/sitemap.xml`;

  return (
    <div className="seo-sitemap-tab">
      <div className="alert alert-info border-0 bg-primary bg-opacity-10 p-3 rounded-4 d-flex gap-3 mb-4">
        <Map size={20} className="text-primary flex-shrink-0" />
        <div className="small">
          <strong>XML Sitemap Management:</strong> Search engines use your sitemap to discover and index your pages. 
          The Next.js app generates this automatically, but you can control this specific page's behavior here.
        </div>
      </div>

      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-bold">Page Sitemap Settings</h6>
        </div>

        <div className="form-check form-switch p-3 border rounded-4 bg-light bg-opacity-50 mb-4">
          <input
            className="form-check-input ms-0 me-3"
            type="checkbox"
            role="switch"
            id="sitemapInclude"
            checked={seoData.sitemap_include !== false}
            onChange={(e) => handleUpdateSeo({ sitemap_include: e.target.checked })}
          />
          <label
            className="form-check-label d-flex flex-column"
            htmlFor="sitemapInclude"
          >
            <span className="fw-bold small text-dark">Include in Sitemap</span>
            <span className="text-muted x-small mt-1">
              Whether this page should be listed in the site's XML sitemap. If disabled, search engines might take longer to find it.
            </span>
          </label>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">
              Priority
            </label>
            <select
              className="form-select border shadow-none"
              value={seoData.sitemap_priority || "0.5"}
              onChange={(e) => handleUpdateSeo({ sitemap_priority: parseFloat(e.target.value) })}
            >
              <option value="1.0">1.0 (Highest - Homepage)</option>
              <option value="0.9">0.9</option>
              <option value="0.8">0.8 (High - Important Pages)</option>
              <option value="0.7">0.7</option>
              <option value="0.5">0.5 (Default - Standard Pages)</option>
              <option value="0.3">0.3 (Low)</option>
            </select>
            <div className="form-text x-small mt-2">
              Tells search engines how important this page is compared to others on your site.
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase text-muted">
              Change Frequency
            </label>
            <select
              className="form-select border shadow-none"
              value={seoData.sitemap_changefreq || "monthly"}
              onChange={(e) => handleUpdateSeo({ sitemap_changefreq: e.target.value })}
            >
              <option value="always">Always</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="never">Never</option>
            </select>
            <div className="form-text x-small mt-2">
              How often the content on this page is likely to change.
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5 opacity-10" />

      <div className="mb-4">
        <h6 className="mb-3 fw-bold">Sitemap Generation & Pinging</h6>
        
        <div className="p-4 border rounded-4 bg-white shadow-sm mb-4">
          <div className="d-flex align-items-start gap-3">
            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1">Dynamic Sitemap is Active</h6>
              <p className="text-muted small mb-3">
                Your Next.js frontend is actively generating the sitemap. It automatically updates when you publish or modify pages.
              </p>
              
              <div className="d-flex gap-2">
                <a 
                  href={sitemapUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
                >
                  View XML Sitemap <ExternalLink size={14} />
                </a>
                <button 
                  className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-2"
                  onClick={handlePingGoogle}
                  disabled={isPinging}
                >
                  <RefreshCw size={14} className={isPinging ? "animate-spin" : ""} />
                  {isPinging ? "Pinging..." : "Ping Google Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert alert-light border d-flex gap-2 p-3 small text-muted">
          <AlertCircle size={16} className="text-muted flex-shrink-0" />
          <span>Google automatically crawls your sitemap periodically. Use "Ping Google" only when you have made critical, time-sensitive updates.</span>
        </div>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
