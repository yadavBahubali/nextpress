"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveTab } from "@/store/slices/seoSlice";
import { Search, Share2, Code, Settings2, BarChart3, AlertCircle } from "lucide-react";
import GeneralTab from "./tabs/GeneralTab";
import AnalysisTab from "./tabs/AnalysisTab";

export default function SeoSidebar() {
  const dispatch = useAppDispatch();
  const { activeTab, score, setupScore } = useAppSelector((state) => state.seo);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success';
    if (s >= 50) return 'text-warning';
    return 'text-danger';
  };

  const handleSetActiveTab = (tab: any) => {
    dispatch(setActiveTab(tab));
  };

  const menuItems = [
    { id: 'general', label: 'General', icon: <Search size={16} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={16} /> },
    { id: 'schema', label: 'Schema', icon: <Code size={16} /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings2 size={16} /> },
  ];

  return (
    <div className="seo-sidebar">
      {/* Intelligent Score Gauge */}
      <div className="bg-light rounded-4 border p-3 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex flex-column">
            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>Content Score</span>
            <div className={`fw-bold h3 mb-0 ${getScoreColor(score)}`}>{score}<small className="text-muted" style={{ fontSize: '0.8rem' }}>/100</small></div>
          </div>
          <div className="d-flex flex-column text-end">
            <span className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.65rem' }}>Setup Progress</span>
            <div className="fw-bold h3 mb-0 text-primary">{setupScore}%</div>
          </div>
        </div>
        
        {/* Dual Progress Bar */}
        <div className="progress-stacked rounded-pill" style={{ height: '8px' }}>
          <div className="progress" role="progressbar" style={{ width: `${score}%` }}>
            <div className={`progress-bar ${score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-danger'}`}></div>
          </div>
          <div className="progress" role="progressbar" style={{ width: `${setupScore}%` }}>
            <div className="progress-bar bg-primary opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Vertical Icon Tabs for Sidebar */}
      <div className="d-flex justify-content-between border-bottom mb-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`btn btn-link p-2 border-bottom border-3 rounded-0 transition-all ${activeTab === item.id ? 'border-primary text-primary' : 'border-transparent text-muted opacity-50'}`}
            onClick={() => handleSetActiveTab(item.id)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="seo-sidebar-content">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'analysis' && <AnalysisTab />}
        
        {['social', 'schema', 'advanced'].includes(activeTab) && (
          <div className="text-center py-5">
            <AlertCircle size={32} className="text-muted mb-2 opacity-25" />
            <p className="small text-muted mb-0">Full controls available in the main SEO Panel below.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .border-transparent {
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
