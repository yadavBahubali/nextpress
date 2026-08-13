"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Search, 
  FileJson, 
  BarChart3,
  HelpCircle,
  ExternalLink,
  Loader2,
  XCircle
} from "lucide-react";
import { seoService } from "@/services/seo.service";

interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  msg?: string;
}

export default function InsightSidebar() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ score: number; checks: SeoCheck[] } | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await seoService.getSiteHealth();
      if (res.status === 'success') {
        setHealth(res.data);
      }
    } catch (error) {
      console.error("Failed to load SEO health:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-2" size={24} />
        <span className="x-small text-muted">Analyzing Site Health...</span>
      </div>
    );
  }

  const score = health?.score || 0;
  const scoreColor = score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="insight-sidebar">
      {/* SEO Health Widget */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center mb-0">
            <h6 className="fw-bold d-flex align-items-center gap-2 mb-0">
              <Activity size={18} className="text-primary" />
              SEO Health Score
            </h6>
            <button className="btn btn-sm btn-light p-1 rounded-circle" onClick={fetchHealth}>
              <Activity size={12} />
            </button>
          </div>
        </div>
        <div className="card-body p-4 text-center">
          <div className="position-relative d-inline-block mb-3">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle 
                cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="10" 
                strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * score / 100)}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="position-absolute top-50 start-50 translate-middle">
              <h3 className="fw-bold mb-0">{score}</h3>
              <span className="text-muted x-small">/100</span>
            </div>
          </div>
          <div className="d-flex justify-content-center gap-2 mb-3">
            <span className={`badge ${score > 80 ? 'bg-success-subtle text-success' : score > 50 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'} rounded-pill px-3`}>
              {score > 80 ? 'Healthy' : score > 50 ? 'Needs Work' : 'Critical'}
            </span>
          </div>
          <p className="text-muted small mb-0">
            {score > 80 ? 'Your site is looking great!' : 'Improve your score by addressing the warnings below.'}
          </p>
        </div>
        <div className="bg-light p-3">
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            {health?.checks.map((check) => (
              <li key={check.id} className="d-flex align-items-start gap-2 small">
                {check.status === 'pass' ? (
                  <CheckCircle2 size={14} className="text-success mt-1 flex-shrink-0" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle size={14} className="text-warning mt-1 flex-shrink-0" />
                ) : (
                  <XCircle size={14} className="text-danger mt-1 flex-shrink-0" />
                )}
                <div className="d-flex flex-column">
                  <span className="fw-medium">{check.label}</span>
                  {check.msg && <span className="x-small text-muted">{check.msg}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
          <h6 className="fw-bold d-flex align-items-center gap-2 mb-0">
            <Zap size={18} className="text-primary" />
            Quick Actions
          </h6>
        </div>
        <div className="card-body p-3">
          <div className="d-grid gap-2">
            <button className="btn btn-light border-0 d-flex align-items-center gap-3 text-start p-2 rounded-3 hover-bg-primary hover-text-white transition-all">
              <div className="bg-white p-2 rounded-2 shadow-sm"><Search size={16} /></div>
              <span className="small fw-medium">Run SEO Audit</span>
            </button>
            <button className="btn btn-light border-0 d-flex align-items-center gap-3 text-start p-2 rounded-3 hover-bg-primary hover-text-white transition-all">
              <div className="bg-white p-2 rounded-2 shadow-sm"><FileJson size={16} /></div>
              <span className="small fw-medium">Schema Generator</span>
            </button>
            <button className="btn btn-light border-0 d-flex align-items-center gap-3 text-start p-2 rounded-3 hover-bg-primary hover-text-white transition-all">
              <div className="bg-white p-2 rounded-2 shadow-sm"><BarChart3 size={16} /></div>
              <span className="small fw-medium">Traffic Report</span>
            </button>
          </div>
        </div>
      </div>

      

      <style jsx>{`
        .x-small { font-size: 0.75rem; }
        .hover-bg-primary:hover { background-color: #0061FF !important; }
        .hover-text-white:hover span { color: white !important; }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
}
