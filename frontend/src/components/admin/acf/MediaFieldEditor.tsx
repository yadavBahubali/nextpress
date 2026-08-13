"use client";

import React from "react";
import { ImageIcon, FileText } from "lucide-react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
}

export default function MediaFieldEditor({ field }: Props) {
  const { updateFieldSetting } = useACFStore();
  const settings = field.settings || {};

  //////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////

  const isGallery = field.type === "gallery";
  const isImage = field.type === "image";
  const isFile = field.type === "file";

  return (
    <div className="mt-4 border-top pt-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h6 className="fw-semibold mb-0">Media Settings</h6>
      </div>

      <div className="row g-4">
        {/* MEDIA TYPE */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label">Allowed Media Type</label>

            <select
              className="wp-form-select"
              value={settings.mediaType || (isFile ? "file" : "image")}
              onChange={(e) =>
                updateFieldSetting(field.id, "mediaType", e.target.value)
              }
            >
              <option value="image">Images</option>

              <option value="file">Files</option>

              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        {/* MULTIPLE */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label d-block">Multiple Selection</label>

            <input
              type="checkbox"
              className="form-check-input"
              checked={settings.multiple || isGallery}
              onChange={(e) =>
                updateFieldSetting(field.id, "multiple", e.target.checked)
              }
              disabled={isGallery}
            />
          </div>
        </div>

        {/* RETURN FORMAT */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label">Return Format</label>
            <select
              className="wp-form-select"
              value={settings.return_format || "array"}
              onChange={(e) =>
                updateFieldSetting(field.id, "return_format", e.target.value)
              }
            >
              <option value="array">Image Array</option>
              <option value="url">Image URL</option>
              <option value="id">Image ID</option>
            </select>
          </div>
        </div>

        {/* LIBRARY */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label">Library</label>
            <select
              className="wp-form-select"
              value={settings.library || "all"}
              onChange={(e) =>
                updateFieldSetting(field.id, "library", e.target.value)
              }
            >
              <option value="all">All</option>
              <option value="uploadedToPost">Uploaded to post</option>
            </select>
          </div>
        </div>

        {/* PREVIEW & INFO */}
        <div className="col-12">
          <div className="border rounded-4 bg-light-subtle p-5 text-center">
            <div className="bg-white shadow-sm d-inline-flex p-4 rounded-circle mb-3">
              {isFile ? (
                <FileText size={40} className="text-primary opacity-75" />
              ) : (
                <ImageIcon size={40} className="text-primary opacity-75" />
              )}
            </div>

            <h6 className="fw-bold mb-2">Field Display Preview</h6>

            <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '400px' }}>
              When editing content, this field will provide a professional {isFile ? 'file browser' : 'image selector'} interface 
              connected directly to your Media Library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
