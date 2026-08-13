"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData } from "@/store/slices/seoSlice";
import { ArrowRightLeft, ExternalLink, Info } from "lucide-react";

export default function RedirectsTab() {
  const dispatch = useAppDispatch();
  const { seoData } = useAppSelector((state) => state.seo);

  const handleUpdateSeo = (data: any) => {
    dispatch(updateSeoData(data));
  };

  const redirectTypes = [
    { value: 301, label: '301 Permanent Redirect' },
    { value: 302, label: '302 Temporary Redirect' },
    { value: 307, label: '307 Temporary Redirect (HTTP/1.1)' },
  ];

  return (
    <div className="seo-redirects-tab">
      <div className="alert alert-light border-0 bg-light p-3 rounded-4 d-flex gap-3 mb-4">
        <Info size={20} className="text-primary flex-shrink-0" />
        <div className="small">
          <strong>Need to move this page?</strong> Set a redirect URL here. When a user visits the current URL, they will be automatically sent to the target destination.
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold small text-uppercase text-muted">Target Redirect URL</label>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <ArrowRightLeft size={16} className="text-muted" />
          </span>
          <input 
            type="text" 
            className="form-control border-start-0 ps-0"
            placeholder="https://example.com/new-location or /internal-path"
            value={seoData?.redirect_url || ""}
            onChange={(e) => handleUpdateSeo({ redirect_url: e.target.value })}
          />
        </div>
        <div className="form-text x-small mt-2">
          Absolute URLs (https://...) or relative paths (/...) are both supported.
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-muted">Redirect Type</label>
          <select 
            className="form-select"
            value={seoData?.redirect_type || 301}
            onChange={(e) => handleUpdateSeo({ redirect_type: parseInt(e.target.value) })}
          >
            {redirectTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {seoData?.redirect_url && (
        <div className="mt-5 pt-4 border-top">
          <div className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                <ExternalLink size={16} />
              </div>
              <div>
                <div className="fw-bold small text-primary">Active Redirect Detected</div>
                <div className="text-muted x-small">This page will redirect to: <span className="text-dark fw-medium">{seoData.redirect_url}</span></div>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-outline-danger border-0 hover-bg-danger px-3 rounded-pill"
              onClick={() => handleUpdateSeo({ redirect_url: '', redirect_type: 301 })}
            >
              Cancel Redirect
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
}
