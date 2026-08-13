"use client";

import React, { useState } from "react";
import { Field } from "@/types/acf";
import { Image as ImageIcon, X, File as FileIcon, Video } from "lucide-react";
import MediaLibraryModal from "../../common/MediaLibraryModal";
import { Media } from "@/services/media.service";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function MediaField({ field, value, onChange }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const settings = field.settings || {};
  
  const isMultiple = settings.multiple === true || field.type === "gallery";
  const mediaType = settings.mediaType || (field.type === "image" ? "image" : "all");
  
  const values = isMultiple ? (Array.isArray(value) ? value : (value ? [value] : [])) : (value ? [value] : []);

  const handleClear = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation();
    if (isMultiple && typeof index === 'number') {
      const newValues = [...values];
      newValues.splice(index, 1);
      onChange(newValues.length > 0 ? newValues : null);
    } else {
      onChange(null);
    }
  };

  const handleSelect = (media: Media | Media[]) => {
    if (isMultiple) {
      const selectedItems = Array.isArray(media) ? media : [media];
      const updatedValues = [...values];
      selectedItems.forEach(item => {
        if (!updatedValues.find(v => (v.id || v) === (item.id || item))) {
          updatedValues.push(item);
        }
      });
      onChange(updatedValues);
    } else {
      const item = Array.isArray(media) ? media[0] : media;
      onChange(item);
    }
  };

  const renderSinglePreview = (item: any, index?: number) => {
    const previewUrl = typeof item === "string" ? item : item?.url;
    const fileName = typeof item === "string" ? item.split('/').pop() : (item?.original_name || item?.url?.split('/').pop());
    const mimeType = item?.mime_type || "";
    
    const isImg = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(previewUrl || "");
    const isVid = mimeType.startsWith('video/') || /\.(mp4|webm|ogg)$/i.test(previewUrl || "");

    if (!previewUrl) return null;

    return (
      <div key={index || 0} className="position-relative d-inline-block me-3 mb-3">
        <div onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
          {isImg ? (
            <div className="border rounded-3 overflow-hidden bg-light shadow-sm" style={{ width: '150px', height: '150px' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-100 h-100" 
                style={{ objectFit: 'cover' }} 
              />
            </div>
          ) : isVid ? (
            <div className="border rounded-3 overflow-hidden bg-dark shadow-sm d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
              <video 
                src={previewUrl} 
                className="w-100 h-100" 
                style={{ objectFit: 'cover' }}
                muted
                onMouseOver={(e) => e.currentTarget.play()}
                onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <div className="position-absolute top-50 start-50 translate-middle pointer-events-none opacity-50">
                <Video size={32} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="border rounded-3 p-3 bg-white shadow-sm d-flex flex-column align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
              <div className="bg-primary-subtle text-primary p-3 rounded-circle mb-2">
                <FileIcon size={32} />
              </div>
              <span className="x-small text-muted text-center text-truncate w-100 px-2">{fileName}</span>
            </div>
          )}
        </div>
        <button 
          className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow"
          onClick={(e) => handleClear(e, index)}
          style={{ zIndex: 10 }}
        >
          <X size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="acf-media-field">
      <div className="d-flex flex-wrap">
        {values.length > 0 ? (
          values.map((item, idx) => renderSinglePreview(item, idx))
        ) : null}

        {(!values.length || isMultiple) && (
          <div 
            className="border border-2 border-dashed rounded-3 p-4 text-center cursor-pointer hover-bg-light transition-all mb-3"
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer', minWidth: '150px', height: '150px' }}
          >
            <div className="h-100 d-flex flex-column align-items-center justify-content-center">
              {mediaType === 'image' ? (
                <ImageIcon className="mx-auto mb-2 text-muted opacity-50" size={32} />
              ) : mediaType === 'video' ? (
                <Video className="mx-auto mb-2 text-muted opacity-50" size={32} />
              ) : (
                <FileIcon className="mx-auto mb-2 text-muted opacity-50" size={32} />
              )}
              <p className="small text-muted mb-0">
                {values.length > 0 ? 'Add More' : `Select ${mediaType === 'image' ? 'Image' : (mediaType === 'video' ? 'Video' : 'File')}`}
              </p>
            </div>
          </div>
        )}
      </div>

      <MediaLibraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        allowMultiple={isMultiple}
        type={mediaType as any}
        title={`Select ${mediaType === 'image' ? 'Image' : (mediaType === 'video' ? 'Video' : 'File')}${isMultiple ? '(s)' : ''}`}
      />

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6 !important;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .x-small {
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
}
