"use client";

import React, { useRef, useState } from "react";
import { AxiosError } from "axios";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { Field } from "@/types/acf";
import { mediaService, Media } from "@/services/media.service";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

// Founder-portal counterpart to MediaField. Deliberately does NOT use
// MediaLibraryModal: that component lets you browse and delete every file
// anyone has ever uploaded, which is fine for CMS staff but not for a
// founder editing their own entry. This only ever does one thing - pick a
// file from your own device, upload it, use it - with no visibility into
// anyone else's media at all.
export default function SelfUploadMediaField({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = typeof value === "string" ? value : (value as Media | undefined)?.url;
  const fileName = (value as Media | undefined)?.original_name;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-selecting the same file later

    setIsUploading(true);
    setError("");
    try {
      const res = await mediaService.uploadMine(file);
      onChange(res.data);
    } catch (err) {
      const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
      setError(message || "Upload failed. Please try a different image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="acf-self-upload-field">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="position-relative d-inline-block">
          <div
            className="border rounded-3 overflow-hidden bg-light shadow-sm"
            style={{ width: 150, height: 150, cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <img src={previewUrl} alt={fileName || "Preview"} className="w-100 h-100" style={{ objectFit: "cover" }} />
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow"
            onClick={handleRemove}
          >
            <FaTimes size={12} />
          </button>
        </div>
      ) : (
        <div
          className="border border-2 border-dashed rounded-3 text-center hover-bg-light transition-all"
          style={{ cursor: isUploading ? "wait" : "pointer", width: 150, height: 150 }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            {isUploading ? (
              <>
                <FaSpinner className="mx-auto mb-2 text-primary animate-spin" size={26} />
                <p className="small text-muted mb-0">Uploading...</p>
              </>
            ) : (
              <>
                <FaImage className="mx-auto mb-2 text-muted opacity-50" size={26} />
                <p className="small text-muted mb-0">Choose from your device</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && <div className="text-danger small mt-2">{error}</div>}

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd !important;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
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
