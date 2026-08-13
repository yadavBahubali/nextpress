"use client";

import React from "react";
import { useAppSelector } from "@/store";

export default function TwitterPreview() {
  const { 
    resolvedTwitterTitle, 
    resolvedTwitterDescription, 
    variables, 
    seoData 
  } = useAppSelector((state) => state.seo);

  const siteUrl = (variables.site_domain || "nextpress.com").replace(/^https?:\/\//, '').toLowerCase();
  const title = resolvedTwitterTitle || "Enter a social title";
  const description = resolvedTwitterDescription || "Provide a summary of your content to entice users to click on your link when shared.";
  
  const image = seoData?.twitter_image || seoData?.og_image || variables.featured_image;

  return (
    <div className="twitter-preview bg-white border rounded-4 shadow-sm overflow-hidden" style={{ maxWidth: '504px' }}>
      <div className="preview-image-container bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center position-relative" style={{ aspectRatio: '1.91/1', overflow: 'hidden' }}>
        {image ? (
          <img src={image} alt="Twitter Preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="text-muted small text-center px-4">
            <div className="mb-2" style={{ fontSize: '2rem' }}>🐦</div>
            Twitter card image will appear here
          </div>
        )}
        <div className="position-absolute bottom-0 start-0 m-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded x-small">
          {siteUrl}
        </div>
      </div>
      <div className="p-3">
        <div className="fw-bold mb-1 title-text text-dark" style={{ fontSize: '15px', lineHeight: '1.3' }}>{title}</div>
        <div className="text-muted description-text" style={{ fontSize: '14px', lineHeight: '1.3' }}>{description}</div>
      </div>

      <style jsx>{`
        .title-text {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .description-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
}
