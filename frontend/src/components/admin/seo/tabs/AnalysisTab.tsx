"use client";

import React from "react";
import { useAppSelector } from "@/store";
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";

export default function AnalysisTab() {
  const { checks, score, seoData } = useAppSelector((state) => state.seo);

  const getIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle2 size={18} className="text-success" />;
      case 'warning': return <AlertTriangle size={18} className="text-warning" />;
      case 'error': return <XCircle size={18} className="text-danger" />;
      default: return null;
    }
  };

  const goodChecks = checks.filter(c => c.status === 'good');
  const warningChecks = checks.filter(c => c.status === 'warning');
  const errorChecks = checks.filter(c => c.status === 'error');

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success border-success';
    if (s >= 50) return 'text-warning border-warning';
    return 'text-danger border-danger';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-success';
    if (s >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="seo-analysis-tab">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h5 className="fw-bold mb-1">SEO Coaching Report</h5>
          <div className="text-muted small">Actionable insights to improve your search visibility.</div>
        </div>
        
        <div className="text-end">
          <div className={`d-inline-flex align-items-center justify-content-center rounded-circle border border-4 ${getScoreColor(score)} mb-1`} style={{ width: '64px', height: '64px' }}>
            <span className="fs-4 fw-bold">{score}</span>
          </div>
          <div className="x-small fw-bold text-uppercase text-muted">Overall Score</div>
        </div>
      </div>

      {!seoData?.focus_keyword ? (
        <div className="alert alert-warning border-0 bg-warning bg-opacity-10 d-flex gap-3 align-items-start p-4 rounded-4">
          <AlertTriangle size={24} className="text-warning flex-shrink-0" />
          <div>
            <h6 className="fw-bold text-dark mb-1">Focus Keyword Missing</h6>
            <p className="small text-muted mb-0">
              The analysis engine requires a focus keyword to evaluate your content's relevance. 
              Please go to the <strong>General Tab</strong> and set the primary keyword you want this page to rank for.
            </p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          
          {/* Errors */}
          {errorChecks.length > 0 && (
            <div className="analysis-section">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-danger rounded-circle p-1" style={{ width: '10px', height: '10px' }}></div>
                  <h6 className="mb-0 fw-bold text-danger text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>Critical Issues ({errorChecks.length})</h6>
                </div>
              </div>
              <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                {errorChecks.map((check) => (
                  <div key={check.id} className="list-group-item d-flex align-items-start gap-3 p-3 bg-white border-bottom">
                    <div className="mt-1 flex-shrink-0">{getIcon(check.status)}</div>
                    <div>
                      <div className="fw-bold small mb-1">{check.label}</div>
                      <div className="small text-muted" dangerouslySetInnerHTML={{ __html: check.message.replace(/Critical:/g, '<strong class="text-danger">Critical:</strong>') }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warningChecks.length > 0 && (
            <div className="analysis-section">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-warning rounded-circle p-1" style={{ width: '10px', height: '10px' }}></div>
                  <h6 className="mb-0 fw-bold text-warning text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>Improvements ({warningChecks.length})</h6>
                </div>
              </div>
              <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                {warningChecks.map((check) => (
                  <div key={check.id} className="list-group-item d-flex align-items-start gap-3 p-3 bg-white border-bottom">
                    <div className="mt-1 flex-shrink-0">{getIcon(check.status)}</div>
                    <div>
                      <div className="fw-bold small mb-1">{check.label}</div>
                      <div className="small text-muted">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Good */}
          {goodChecks.length > 0 && (
            <div className="analysis-section mt-2">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-success rounded-circle p-1" style={{ width: '10px', height: '10px' }}></div>
                  <h6 className="mb-0 fw-bold text-success text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>Good Results ({goodChecks.length})</h6>
                </div>
              </div>
              <div className="list-group list-group-flush border rounded-4 overflow-hidden shadow-sm">
                {goodChecks.map((check) => (
                  <div key={check.id} className="list-group-item d-flex align-items-start gap-3 p-3 bg-white border-bottom">
                    <div className="mt-1 flex-shrink-0">{getIcon(check.status)}</div>
                    <div>
                      <div className="fw-bold small mb-1 text-dark">{check.label}</div>
                      <div className="small text-muted">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .list-group-item:last-child { border-bottom: none !important; }
      `}</style>
    </div>
  );
}
