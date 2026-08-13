"use client";

import React, { useState } from "react";
import { Field } from "@/types/acf";
import { Image as ImageIcon, X, Plus } from "lucide-react";
import MediaLibraryModal from "../../common/MediaLibraryModal";
import { Media } from "@/services/media.service";

interface Props {
  field: Field;
  value: any[];
  onChange: (value: any[]) => void;
}

export default function GalleryField({ field, value, onChange }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = Array.isArray(value) ? value : [];

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleSelect = (media: Media | Media[]) => {
    const newItems = Array.isArray(media) ? media : [media];
    // Avoid duplicates by ID if possible, or just append
    const updatedGallery = [...images];
    
    newItems.forEach(item => {
      if (!updatedGallery.find(img => img.id === item.id)) {
        updatedGallery.push(item);
      }
    });

    onChange(updatedGallery);
  };

  return (
    <div className="acf-gallery-field">
      <div className="d-flex flex-wrap gap-3 mb-3">
        {images.map((img, index) => {
          const url = typeof img === "string" ? img : img?.url;
          const id = typeof img === "object" ? img.id : index;
          return (
            <div key={id} className="position-relative">
              <div className="border rounded-3 overflow-hidden bg-light shadow-sm" style={{ width: '120px', height: '120px' }}>
                <img 
                  src={url} 
                  alt={`Gallery ${index}`} 
                  className="w-100 h-100" 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <button 
                className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow"
                onClick={() => handleRemove(index)}
                style={{ zIndex: 2 }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
        
        <div 
          className="border border-2 border-dashed rounded-3 d-flex flex-column align-items-center justify-content-center cursor-pointer hover-bg-light transition-all"
          onClick={() => setIsModalOpen(true)}
          style={{ width: '120px', height: '120px', cursor: 'pointer' }}
        >
          <Plus className="text-muted opacity-50" size={24} />
          <span className="small text-muted mt-1">Add</span>
        </div>
      </div>

      <MediaLibraryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        allowMultiple={true}
        type="image"
        title="Add Images to Gallery"
      />

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6 !important;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
