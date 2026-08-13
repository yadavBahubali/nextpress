"use client";

import React from "react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
}

export default function AccordionFieldEditor({ field }: Props) {
  const { updateFieldSetting } = useACFStore();
  const settings = field.settings || {};

  return (
    <div className="mt-4 pt-4 border-top">
      <div className="row g-4">
        {/* Open */}
        <div className="col-md-4">
          <label className="acf-label">Open</label>
          <p className="acf-hint">Display this accordion as open on load.</p>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={`open-${field.id}`}
              checked={!!settings.open}
              onChange={(e) => updateFieldSetting(field.id, "open", e.target.checked)}
              style={{ width: "2.4em", height: "1.25em", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Multi-expand */}
        <div className="col-md-4">
          <label className="acf-label">Multi-expand</label>
          <p className="acf-hint">Allow this accordion to be open alongside others.</p>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={`multi-expand-${field.id}`}
              checked={!!settings.multi_expand}
              onChange={(e) => updateFieldSetting(field.id, "multi_expand", e.target.checked)}
              style={{ width: "2.4em", height: "1.25em", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Endpoint */}
        <div className="col-md-4">
          <label className="acf-label">Endpoint</label>
          <p className="acf-hint">This accordion will close previous accordions.</p>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={`endpoint-accordion-${field.id}`}
              checked={!!settings.endpoint}
              onChange={(e) => updateFieldSetting(field.id, "endpoint", e.target.checked)}
              style={{ width: "2.4em", height: "1.25em", cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .acf-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #495057;
          margin-bottom: 4px;
        }
        .acf-hint {
          font-size: 0.78rem;
          color: #868e96;
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
