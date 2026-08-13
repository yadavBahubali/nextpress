"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPreviewDevice } from "@/store/slices/seoSlice";
import { Monitor, Smartphone } from "lucide-react";

interface SeoLivePreviewProps {
  slug: string;
}

export default function SeoLivePreview({ slug }: SeoLivePreviewProps) {
  const dispatch = useAppDispatch();
  const { resolvedTitle, resolvedDescription, previewDevice, variables } = useAppSelector((state) => state.seo);
  
  const siteUrl = variables.site_domain || "https://nextpress.com"; 
  const displayUrl = `${siteUrl}/${slug}`;
  
  const title = resolvedTitle?.value || "Please enter a meta title";
  const description = resolvedDescription?.value || "Please enter a meta description to see how your page will look in search results.";

  const handleSetPreviewDevice = (device: 'desktop' | 'mobile') => {
    dispatch(setPreviewDevice(device));
  };

  return (
    <div className="bg-light rounded-3 p-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>Snippet Preview</span>
        <div className="btn-group btn-group-sm">
          <button 
            className={`btn btn-outline-secondary ${previewDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => handleSetPreviewDevice('desktop')}
          >
            <Monitor size={14} className="me-1" /> Desktop
          </button>
          <button 
            className={`btn btn-outline-secondary ${previewDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => handleSetPreviewDevice('mobile')}
          >
            <Smartphone size={14} className="me-1" /> Mobile
          </button>
        </div>
      </div>

      <div className={`google-preview bg-white border rounded p-4 ${previewDevice === 'mobile' ? 'mobile-preview' : ''}`} style={{ maxWidth: previewDevice === 'mobile' ? '360px' : '600px', margin: previewDevice === 'mobile' ? '0 auto' : '0' }}>
        <div className="google-url text-muted small mb-1 overflow-hidden text-nowrap" style={{ fontSize: '14px', color: '#202124' }}>
          {displayUrl}
        </div>
        <h3 className="google-title mb-1" style={{ 
          fontSize: previewDevice === 'mobile' ? '20px' : '18px', 
          color: '#1a0dab', 
          fontWeight: '400', 
          cursor: 'pointer', 
          fontFamily: 'arial, sans-serif', 
          lineHeight: '1.3',
          maxWidth: '100%',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h3>
        <div className="google-description" style={{ 
          fontSize: '14px', 
          color: '#4d5156', 
          fontFamily: 'arial, sans-serif', 
          lineHeight: '1.58',
          maxWidth: '100%',
          display: '-webkit-box',
          WebkitLineClamp: previewDevice === 'mobile' ? 3 : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {description}
        </div>
      </div>
      
      <style jsx>{`
        .google-preview {
          box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
        }
        .google-title:hover {
          text-decoration: underline;
        }
        .mobile-preview .google-url {
          font-size: 12px;
        }
        .mobile-preview .google-title {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
