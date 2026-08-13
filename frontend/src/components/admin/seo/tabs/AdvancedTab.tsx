"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData } from "@/store/slices/seoSlice";
import {
  Settings2,
  Globe,
  EyeOff,
  Link,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export default function AdvancedTab() {
  const dispatch = useAppDispatch();
  const { seoData, variables } = useAppSelector((state) => state.seo);

  const handleUpdateSeo = (data: any) => {
    dispatch(updateSeoData(data));
  };

  const defaultCanonical = `${variables.site_domain || "https://nextpress.com"}/${variables.slug || ""}`;

  return (
    <>
      <div className="seo-advanced-tab">
        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <Globe size={18} className="text-primary" />
            <h6 className="mb-0 fw-bold">Robots & Indexing</h6>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="form-check form-switch p-3 border rounded-4 bg-light bg-opacity-50">
                <input
                  className="form-check-input ms-0 me-3"
                  type="checkbox"
                  role="switch"
                  id="noindexSwitch"
                  checked={seoData?.is_noindex || false}
                  onChange={(e) => handleUpdateSeo({ is_noindex: e.target.checked })}
                />
                <label
                  className="form-check-label d-flex flex-column"
                  htmlFor="noindexSwitch"
                >
                  <span className="fw-bold small d-flex align-items-center gap-2">
                    <EyeOff size={14} /> No-Index
                  </span>
                  <span className="text-muted x-small mt-1">
                    Prevents search engines from showing this page in results.
                  </span>
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-check form-switch p-3 border rounded-4 bg-light bg-opacity-50">
                <input
                  className="form-check-input ms-0 me-3"
                  type="checkbox"
                  role="switch"
                  id="nofollowSwitch"
                  checked={seoData?.is_nofollow || false}
                  onChange={(e) => handleUpdateSeo({ is_nofollow: e.target.checked })}
                />
                <label
                  className="form-check-label d-flex flex-column"
                  htmlFor="nofollowSwitch"
                >
                  <span className="fw-bold small d-flex align-items-center gap-2">
                    <Link size={14} /> No-Follow
                  </span>
                  <span className="text-muted x-small mt-1">
                    Prevents search engines from following links on this page.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-5 opacity-10" />

        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Link size={18} className="text-primary" />
            <h6 className="mb-0 fw-bold">Canonical URL</h6>
          </div>
          <p className="text-muted small mb-3">
            If this page is a duplicate of another, specify the primary URL
            here.
          </p>
          <input
            type="text"
            className="form-control"
            placeholder={`Default: ${defaultCanonical}`}
            value={seoData?.canonical_url || ""}
            onChange={(e) => handleUpdateSeo({ canonical_url: e.target.value })}
          />
          <div className="form-text x-small mt-2">
            Use the full URL starting with <code>https://</code>
          </div>
        </div>
      </div>

      <style>{`
        .x-small { font-size: 0.7rem; }
      `}</style>
    </>
  );
}
