"use client";

import React from "react";
import { useAppSelector } from "@/store";

export default function FacebookPreview() {
  const { 
    resolvedOgTitle, 
    resolvedOgDescription, 
    variables, 
    seoData 
  } = useAppSelector((state) => state.seo);

  const siteUrl = (variables.site_domain || "nextpress.com").replace(/^https?:\/\//, '');
  const title = resolvedOgTitle || "Enter a social title";
  const description = resolvedOgDescription || "Provide a summary of your content to entice users to click on your link when shared.";
  
  const image = seoData?.og_image || variables.featured_image;

  return (
    <div className="facebook-preview bg-white border rounded shadow-sm overflow-hidden" style={{ maxWidth: '524px' }}>
      <div className="preview-image-container bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ aspectRatio: '1.91/1', overflow: 'hidden' }}>
        {image ? (
          <img src={image} alt="Facebook Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="text-muted small text-center px-4">
            <div className="mb-2" style={{ fontSize: '2rem' }}>🖼️</div>
            Featured image will appear here
          </div>
        )}
      </div>
      <div className="p-3 border-top bg-light">
        <div className="text-uppercase x-small text-muted mb-1 ls-wide">{siteUrl}</div>
        <div className="fw-bold mb-1 title-text text-dark" style={{ fontSize: '16px', lineHeight: '1.2' }}>{title}</div>
        <div className="text-muted description-text" style={{ fontSize: '14px', lineHeight: '1.4' }}>{description}</div>
      </div>

      <style jsx>{`
        .ls-wide { letter-spacing: 0.05em; }
        .title-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .description-text {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
}
