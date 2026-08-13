"use client";

import React, { useState } from "react";
import { 
  ArrowRightLeft, 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface RedirectsTabProps {
  redirects: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export default function RedirectsTab({ redirects, searchQuery, setSearchQuery, onAdd, onDelete }: RedirectsTabProps) {
  const filteredRedirects = redirects.filter(r => 
    (r.source_path?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.redirect_url?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="redirects-tab">
      {/* Stats row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
              <ArrowRightLeft size={24} />
            </div>
            <div>
              <h3 className="fw-bold mb-0">{redirects.length}</h3>
              <span className="text-muted small">Total Redirects</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="fw-bold mb-0">1,284</h3>
              <span className="text-muted small">Total Hits (30d)</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-primary text-white rounded-4 p-4 d-flex flex-row align-items-center justify-content-between">
            <div>
              <h6 className="fw-bold mb-1">New Redirect</h6>
              <span className="x-small opacity-75 text-uppercase fw-bold">Manual Entry</span>
            </div>
            <button className="btn btn-white btn-sm rounded-circle p-2 shadow-sm" onClick={onAdd}>
              <Plus size={20} className="text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Management Area */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 p-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group bg-light rounded-pill px-3 py-1">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <Search size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none ps-0" 
                  placeholder="Search redirects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <button className="btn btn-light border-0 rounded-pill px-3 d-inline-flex align-items-center gap-2 small fw-bold">
                <Filter size={16} /> Filter by Type
              </button>
            </div>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Source Path</th>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted text-center" style={{ width: '80px' }}></th>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Destination</th>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Type</th>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted">Hits</th>
                <th className="py-3 px-4 border-0 small text-uppercase fw-bold text-muted text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRedirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="opacity-25 mb-2"><ArrowRightLeft size={48} /></div>
                    <p className="text-muted small mb-0">No active redirects matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredRedirects.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4">
                      <code className="text-white small bg-primary bg-opacity-5 px-2 py-1 rounded">
                        {r.source_path || `(ID: ${r.entity_id})`}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ArrowRight size={14} className="text-muted" />
                    </td>
                    <td className="py-3 px-4 fw-medium small">
                      {r.redirect_url}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge rounded-pill px-3 ${r.redirect_type === 301 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {r.redirect_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted small">
                      {Math.floor(Math.random() * 500)}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <a href={r.redirect_url} target="_blank" className="btn btn-sm btn-light border p-2 rounded-circle hover-shadow">
                          <ExternalLink size={14} />
                        </a>
                        <button 
                          className="btn btn-sm btn-light border p-2 rounded-circle text-danger hover-shadow"
                          onClick={() => onDelete(r.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert alert-light border-0 rounded-4 p-4 mt-4 d-flex gap-3">
        <AlertCircle size={20} className="text-muted flex-shrink-0" />
        <p className="x-small text-muted mb-0">
          <strong>301 Moved Permanently:</strong> Use this for SEO-friendly permanent redirects. <br/>
          <strong>302 Found (Temporary):</strong> Use this for temporary maintenance or time-limited pages.
        </p>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.75rem; }
        .hover-shadow:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn-white { background: white; border: 0; }
      `}</style>
    </div>
  );
}
