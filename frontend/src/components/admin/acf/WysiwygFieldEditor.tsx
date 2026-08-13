"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
}

export default function WysiwygFieldEditor({ field }: Props) {
  const { updateFieldSetting } = useACFStore();
  const settings = field.settings || {};

  const handleUpdateSetting = (key: string, value: any) => {
    updateFieldSetting(field.id, key, value);
  };

  return (
    <div className="mt-4 border-top pt-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h6 className="fw-semibold mb-0">Wysiwyg Settings</h6>
      </div>

      <div className="row g-4">
        {/* TOOLBAR */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label">Toolbar Style</label>

            <select
              className="wp-form-select"
              value={settings.toolbar || "basic"}
              onChange={(e) =>
                handleUpdateSetting("toolbar", e.target.value)
              }
            >
              <option value="basic">Basic</option>

              <option value="full">Full</option>
            </select>
          </div>
        </div>

        {/* MEDIA UPLOAD */}
        <div className="col-md-6">
          <div className="wp-form-group">
            <label className="wp-form-label d-block">Allow Media Uploads</label>

            <input
              type="checkbox"
              checked={settings.mediaUpload || false}
              onChange={(e) =>
                handleUpdateSetting("mediaUpload", e.target.checked)
              }
            />
          </div>
        </div>

        {/* PREVIEW */}
        <div className="col-12">
          <div className="border rounded bg-light-subtle p-5 text-center">
            <div className="mb-3">
              <FileText size={36} className="text-muted" />
            </div>

            <h6 className="fw-semibold">Wysiwyg Editor Placeholder</h6>

            <p className="text-muted small mb-0">
              Rich text editor integration will be connected later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
