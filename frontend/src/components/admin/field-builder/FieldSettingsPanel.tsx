"use client";

import React from "react";
import { useSchemaStore, FieldType } from "@/app/[admin]/blogs/builder/store";
import { FaCogs, FaCheckCircle, FaPalette, FaEyeSlash, FaInfoCircle } from "react-icons/fa";

export default function FieldSettingsPanel() {
  const { activeFieldId, currentPage, updateField } = useSchemaStore();
  const [activeTab, setActiveTab] = React.useState('general');

  // Find active field recursively
  const activeField = React.useMemo(() => {
    if (!activeFieldId) return null;
    const findRecursive = (fields: any[]): any => {
      for (const f of fields) {
        if (f.id === activeFieldId) return f;
        if (f.subFields) {
          const found = findRecursive(f.subFields);
          if (found) return found;
        }
      }
      return null;
    };
    for (const sec of currentPage.sections) {
      const found = findRecursive(sec.fields);
      if (found) return found;
    }
    return null;
  }, [activeFieldId, currentPage.sections]);

  if (!activeField) {
    return (
      <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center text-center p-5 bg-white rounded-4">
        <div>
          <FaCogs size={64} className="text-muted opacity-25 mb-4" />
          <h5 className="fw-bold text-muted">Select a Field</h5>
          <p className="text-muted small">Choose a field from the tree to configure its settings.</p>
        </div>
      </div>
    );
  }

  const update = (updates: any) => updateField(activeField.id, updates);
  const updateSettings = (settingUpdates: any) => updateField(activeField.id, { settings: settingUpdates });

  return (
    <div className="card border-0 shadow-sm border-top border-primary border-4 h-100 bg-white">
      <div className="card-header bg-white py-3 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <FaCogs className="text-primary" /> Settings: <span className="text-dark">{activeField.label}</span>
          </h6>
          <span className="badge bg-light text-primary border small text-uppercase">{activeField.type}</span>
        </div>
      </div>

      <div className="card-body p-0 d-flex flex-column h-100">
        {/* Tabs */}
        <ul className="nav nav-tabs nav-fill border-0 bg-light p-1">
          <li className="nav-item">
            <button className={`nav-link border-0 small fw-bold py-2 ${activeTab === 'general' ? 'active shadow-sm rounded bg-white text-primary' : 'text-muted'}`} onClick={() => setActiveTab('general')}>General</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link border-0 small fw-bold py-2 ${activeTab === 'validation' ? 'active shadow-sm rounded bg-white text-primary' : 'text-muted'}`} onClick={() => setActiveTab('validation')}>Validation</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link border-0 small fw-bold py-2 ${activeTab === 'presentation' ? 'active shadow-sm rounded bg-white text-primary' : 'text-muted'}`} onClick={() => setActiveTab('presentation')}>Layout</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link border-0 small fw-bold py-2 ${activeTab === 'conditional' ? 'active shadow-sm rounded bg-white text-primary' : 'text-muted'}`} onClick={() => setActiveTab('conditional')}>Logic</button>
          </li>
        </ul>

        <div className="tab-content p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {activeTab === 'general' && (
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold">Field Label</label>
                <input type="text" className="form-control" value={activeField.label} onChange={e => update({ label: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Field Name (Slug/Key)</label>
                <input type="text" className="form-control font-monospace" value={activeField.name} onChange={e => update({ name: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Placeholder</label>
                <input type="text" className="form-control" value={activeField.settings.placeholder || ""} onChange={e => updateSettings({ placeholder: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Help Text</label>
                <textarea className="form-control small" rows={2} value={activeField.settings.helpText || ""} onChange={e => updateSettings({ helpText: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Default Value</label>
                <input type="text" className="form-control" value={activeField.settings.defaultValue || ""} onChange={e => updateSettings({ defaultValue: e.target.value })} />
              </div>

              {/* Type Specific - Choices for selection types */}
              {['select', 'radio', 'checkbox', 'button_group'].includes(activeField.type) && (
                <div className="col-12 border-top pt-3 mt-3">
                  <label className="form-label small fw-bold text-primary">Choices (value : Label)</label>
                  <textarea className="form-control font-monospace small" rows={5} value={activeField.settings.choices || ""} placeholder="red : Red&#10;blue : Blue" onChange={e => updateSettings({ choices: e.target.value })} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="row g-3">
              <div className="col-12">
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="reqCheck" checked={activeField.settings.required || false} onChange={e => updateSettings({ required: e.target.checked })} />
                  <label className="form-check-label fw-bold small" htmlFor="reqCheck">Mandatory Field</label>
                </div>
              </div>
              {activeField.type === 'number' && (
                <>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Min Value</label>
                    <input type="number" className="form-control" value={activeField.settings.min || ""} onChange={e => updateSettings({ min: Number(e.target.value) })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Max Value</label>
                    <input type="number" className="form-control" value={activeField.settings.max || ""} onChange={e => updateSettings({ max: Number(e.target.value) })} />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'presentation' && (
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold">Field Width</label>
                <select className="form-select" value={activeField.settings.width} onChange={e => updateSettings({ width: e.target.value })}>
                  <option value="25">25% (1/4 Width)</option>
                  <option value="33">33% (1/3 Width)</option>
                  <option value="50">50% (1/2 Width)</option>
                  <option value="66">66% (2/3 Width)</option>
                  <option value="75">75% (3/4 Width)</option>
                  <option value="100">100% (Full Width)</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Custom CSS Class</label>
                <input type="text" className="form-control" value={activeField.settings.cssClass || ""} onChange={e => updateSettings({ cssClass: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'conditional' && (
            <div className="text-center py-4 bg-light rounded border border-dashed">
              <FaEyeSlash size={32} className="text-muted mb-2 opacity-50" />
              <p className="text-muted small mb-0">Conditional logic configuration will be available in v2.0.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-footer bg-white py-3 border-top d-flex gap-2">
        <button className="btn btn-primary btn-sm flex-grow-1 fw-bold shadow-sm">
          <FaCheckCircle className="me-2" /> Apply Changes
        </button>
      </div>
    </div>
  );
}
