"use client";

import React from "react";
import { useACFStore } from "@/store/acfStore";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
}

export default function TabFieldEditor({ field }: Props) {
  const { updateFieldSetting } = useACFStore();
  const settings = field.settings || {};

  const handleUpdateSetting = (key: string, value: any) => {
    updateFieldSetting(field.id, key, value);
  };

  return (
    <div className="mt-4 pt-4 border-top">
      <div className="row g-4">
        {/* Placement */}
        <div className="col-md-6">
          <label className="acf-label">Placement</label>
          <p className="acf-hint">Choose where the tabs should be displayed.</p>
          <select
            className="form-select form-select-sm border-solid"
            value={settings.placement || "top"}
            onChange={(e) => handleUpdateSetting("placement", e.target.value)}
          >
            <option value="top">Top aligned</option>
            <option value="left">Left aligned</option>
          </select>
        </div>

        {/* Start New Group (Endpoint) */}
        <div className="col-md-6">
          <label className="acf-label">Start New Group</label>
          <p className="acf-hint">Grouping tabs together helps organize the edit screen.</p>
          <div className="d-flex align-items-center mt-2">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={`endpoint-${field.id}`}
                checked={!!settings.endpoint}
                onChange={(e) => handleUpdateSetting("endpoint", e.target.checked)}
                style={{ width: "2.4em", height: "1.25em", cursor: "pointer" }}
              />
            </div>
            <label 
              className="ms-2 small text-muted cursor-pointer" 
              htmlFor={`endpoint-${field.id}`}
              style={{ cursor: 'pointer' }}
            >
              {settings.endpoint ? "This tab will start a new group" : "This tab will be added to the previous group"}
            </label>
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
        .border-solid {
          border: 1px solid #dee2e6;
        }
      `}</style>
    </div>
  );
}
