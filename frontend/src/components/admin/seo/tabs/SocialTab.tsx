"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateSeoData } from "@/store/slices/seoSlice";
import { Image as ImageIcon, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { FaFacebook, FaTwitter} from "react-icons/fa";
import {X} from "lucide-react";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";
import FacebookPreview from "../preview/FacebookPreview";
import TwitterPreview from "../preview/TwitterPreview";

export default function SocialTab() {
  const dispatch = useAppDispatch();
  const { 
    seoData, 
    resolvedOgTitle,
    resolvedOgDescription,
    resolvedTwitterTitle,
    resolvedTwitterDescription,
    variables 
  } = useAppSelector((state) => state.seo);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = React.useState(false);
  const [mediaTarget, setMediaTarget] = React.useState<'og' | 'twitter'>('og');

  const handleImageSelect = (media: any) => {
    const url = Array.isArray(media) ? media[0].url : media.url;
    if (mediaTarget === 'og') {
      dispatch(updateSeoData({ og_image: url }));
    } else {
      dispatch(updateSeoData({ twitter_image: url }));
    }
    setIsMediaModalOpen(false);
  };

  const openMediaModal = (target: 'og' | 'twitter') => {
    setMediaTarget(target);
    setIsMediaModalOpen(true);
  };

  const handleUpdateSeo = (data: any) => {
    dispatch(updateSeoData(data));
  };

  // Logic to determine active images
  const ogImage = seoData?.og_image || variables.featured_image;
  const twitterImage = seoData?.twitter_image || seoData?.og_image || variables.featured_image;

  return (
    <div className="seo-social-tab">
      <div className="alert alert-light border-0 bg-light p-3 rounded-4 d-flex gap-3 mb-4">
        <AlertCircle size={20} className="text-primary flex-shrink-0" />
        <div className="small">
          <strong>Social Previews:</strong> Control how your content looks when shared on Facebook, X (Twitter), and LinkedIn. 
          By default, these inherit from your SEO title and description.
        </div>
      </div>

      <div className="row g-5">
        {/* Facebook / Open Graph Section */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2 text-primary">
              <FaFacebook size={22} />
              <h6 className="mb-0 fw-bold">Facebook / LinkedIn</h6>
            </div>
            {!seoData?.og_title && !seoData?.og_description && (
              <span className="badge rounded-pill bg-success bg-opacity-10 text-success x-small border border-success border-opacity-25">
                <RefreshCw size={10} className="me-1 animate-spin-slow" /> Sync Active
              </span>
            )}
          </div>

          <div className="mb-4">
            <FacebookPreview />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase text-muted">Social Title</label>
            <input 
              type="text" 
              className={`form-control ${!seoData?.og_title ? 'bg-light border-dashed-custom text-muted' : ''}`}
              placeholder="Inheriting from SEO Title..."
              value={resolvedOgTitle}
              onChange={(e) => handleUpdateSeo({ og_title: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase text-muted">Social Description</label>
            <textarea 
              className={`form-control ${!seoData?.og_description ? 'bg-light border-dashed-custom text-muted' : ''}`}
              rows={3}
              placeholder="Inheriting from SEO Description..."
              value={resolvedOgDescription}
              onChange={(e) => handleUpdateSeo({ og_description: e.target.value })}
            />
          </div>

          <div className="mb-0">
            <label className="form-label small fw-bold text-uppercase text-muted">Social Image</label>
            <div 
              className="border-2 border-dashed rounded-4 p-3 text-center bg-light cursor-pointer hover-bg-white transition-all position-relative overflow-hidden"
              onClick={() => openMediaModal('og')}
              style={{ minHeight: '80px' }}
            >
              {ogImage ? (
                <div className="d-flex align-items-center gap-3 text-start position-relative z-1">
                  <img src={ogImage} alt="OG" className="rounded shadow-sm" style={{ width: '80px', height: '45px', objectFit: 'cover' }} />
                  <div>
                    <div className="fw-bold x-small">{seoData?.og_image ? 'Custom Social Image' : 'Using Featured Image'}</div>
                    <div className="text-muted x-small">Click to change or override</div>
                  </div>
                  {seoData?.og_image && (
                    <button 
                      className="btn btn-xs btn-danger rounded-circle p-1 ms-auto position-relative z-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSeo({ og_image: '' });
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  <ImageIcon size={20} className="text-muted mb-1" />
                  <div className="fw-bold text-muted x-small">Select Social Image</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Twitter Section */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2 text-dark">
              <FaTwitter size={22} />
              <h6 className="mb-0 fw-bold">X (Twitter) Preview</h6>
            </div>
            {!seoData?.twitter_title && !seoData?.twitter_description && (
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary x-small border border-primary border-opacity-25">
                <RefreshCw size={10} className="me-1 animate-spin-slow" /> Auto-Inherit
              </span>
            )}
          </div>

          <div className="mb-4">
            <TwitterPreview />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase text-muted">Twitter Title</label>
            <input 
              type="text" 
              className={`form-control ${!seoData?.twitter_title ? 'bg-light border-dashed-custom text-muted' : ''}`}
              placeholder="Inheriting from Social Title..."
              value={seoData?.twitter_title || ''}
              onChange={(e) => handleUpdateSeo({ twitter_title: e.target.value })}
            />
            {!seoData?.twitter_title && <div className="x-small text-muted mt-1 italic">Preview: {resolvedTwitterTitle}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase text-muted">Twitter Description</label>
            <textarea 
              className={`form-control ${!seoData?.twitter_description ? 'bg-light border-dashed-custom text-muted' : ''}`}
              rows={3}
              placeholder="Inheriting from Social Description..."
              value={seoData?.twitter_description || ''}
              onChange={(e) => handleUpdateSeo({ twitter_description: e.target.value })}
            />
            {!seoData?.twitter_description && <div className="x-small text-muted mt-1 italic">Preview: {resolvedTwitterDescription}</div>}
          </div>

          <div className="mb-0">
            <label className="form-label small fw-bold text-uppercase text-muted">Twitter Image</label>
            <div 
              className="border-2 border-dashed rounded-4 p-3 text-center bg-light cursor-pointer hover-bg-white transition-all position-relative overflow-hidden"
              onClick={() => openMediaModal('twitter')}
              style={{ minHeight: '80px' }}
            >
              {twitterImage ? (
                <div className="d-flex align-items-center gap-3 text-start position-relative z-1">
                  <img src={twitterImage} alt="Twitter" className="rounded shadow-sm" style={{ width: '80px', height: '45px', objectFit: 'cover' }} />
                  <div>
                    <div className="fw-bold x-small">{seoData?.twitter_image ? 'Custom Twitter Image' : (seoData?.og_image ? 'Using Facebook Image' : 'Using Featured Image')}</div>
                    <div className="text-muted x-small">Click to change or override</div>
                  </div>
                  {seoData?.twitter_image && (
                    <button 
                      className="btn btn-xs btn-danger rounded-circle p-1 ms-auto position-relative z-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSeo({ twitter_image: '' });
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  <ImageIcon size={20} className="text-muted mb-1" />
                  <div className="fw-bold text-muted x-small">Select Twitter Image</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleImageSelect}
      />

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        :global(.border-dashed-custom) {
          border-style: dashed !important;
          border-color: #cbd5e1 !important;
        }
      `}</style>
    </div>
  );
}
