"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSeo, saveSeo, setActiveTab, setVariables, runAnalysis } from "@/store/slices/seoSlice";
import { settingsService } from "@/services/settings.service";
import SeoLivePreview from "./SeoLivePreview";
import GeneralTab from "./tabs/GeneralTab";
import AnalysisTab from "./tabs/AnalysisTab";
import SocialTab from "./tabs/SocialTab";
import SchemaTab from "./tabs/SchemaTab";
import AdvancedTab from "./tabs/AdvancedTab";
import RedirectsTab from "./tabs/RedirectsTab";
import SitemapTab from "./tabs/SitemapTab";
import { 
  Search, 
  Share2, 
  Code, 
  Settings2, 
  BarChart3, 
  Save, 
  Loader2,
  ArrowRightLeft,
  Map
} from "lucide-react";

interface SeoPanelProps {
  entityType: string;
  entityId: number | string | null;
  slug: string;
  title: string;
  content: string;
  featuredImage?: string;
  manualExcerpt?: string;
}

export default function SeoPanel({ entityType, entityId, slug, title, content, featuredImage, manualExcerpt }: SeoPanelProps) {
  const dispatch = useAppDispatch();
  const { 
    seoData, 
    activeTab, 
    isLoading, 
    isDirty,
    score,
    setupScore
  } = useAppSelector((state) => state.seo);

  useEffect(() => {
    dispatch(fetchSeo({ entityType, entityId }));
  }, [entityType, entityId, dispatch]);

  // The preview/canonical/%site_domain% fallbacks all read variables.site_domain,
  // but nothing populated it before now - it silently fell back to a hardcoded
  // "nextpress.com" placeholder in every consumer. Fetch the real configured
  // domain once so the admin preview matches what actually ships to visitors.
  useEffect(() => {
    settingsService.getSetting('site_domain').then((res) => {
      if (res.data) dispatch(setVariables({ site_domain: res.data }));
    }).catch(() => {
      // No configured domain yet (e.g. fresh install) - consumers keep their
      // own fallback in that case.
    });
  }, [dispatch]);

  useEffect(() => {
    if (seoData) {
      dispatch(runAnalysis({ content, slug, title, excerpt: manualExcerpt }));
    }
  }, [content, slug, title, manualExcerpt, seoData, dispatch]);

  // Sync featured image to variables
  useEffect(() => {
    if (featuredImage) {
      dispatch(setVariables({ featured_image: featuredImage }));
    }
  }, [featuredImage, dispatch]);

  const handleSaveSeo = () => {
    if (seoData) {
      dispatch(saveSeo({ entityType, entityId, data: seoData }));
    }
  };

  const handleSetActiveTab = (tab: any) => {
    dispatch(setActiveTab(tab));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Search size={16} /> },
    { id: 'social', label: 'Social', icon: <Share2 size={16} /> },
    { id: 'schema', label: 'Schema', icon: <Code size={16} /> },
    { id: 'redirects', label: 'Redirects', icon: <ArrowRightLeft size={16} /> },
    { id: 'sitemap', label: 'Sitemap', icon: <Map size={16} /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings2 size={16} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={16} /> },
  ];

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'bg-success';
    if (s >= 50) return 'bg-warning text-dark';
    return 'bg-danger';
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h6 className="mb-0 fw-bold">SEO Optimization</h6>
          <div className="d-flex gap-2">
            <span className={`badge rounded-pill ${getScoreColor(score)} d-flex align-items-center gap-1`} title="Content Optimization Score">
              <BarChart3 size={12} /> {score}/100
            </span>
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-flex align-items-center gap-1" title="Technical Setup Progress">
              <Settings2 size={12} /> {setupScore}% Complete
            </span>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 rounded-pill fw-bold shadow-sm"
          onClick={handleSaveSeo}
          disabled={!isDirty || isLoading}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save SEO
        </button>
      </div>

      <div className="card-body p-0">
        <div className="row g-0">
          {/* Sidebar Tabs */}
          <div className="col-md-3 border-end bg-light">
            <div className="list-group list-group-flush">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`list-group-item list-group-item-action border-0 d-flex align-items-center gap-2 py-3 px-4 ${activeTab === tab.id ? 'active bg-white text-primary border-start border-primary border-4' : 'bg-transparent text-muted'}`}
                  onClick={() => handleSetActiveTab(tab.id as any)}
                  style={activeTab === tab.id ? { borderLeftWidth: '4px !important' } : {}}
                >
                  {tab.icon}
                  <span className="small fw-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-md-9 p-4 bg-white" style={{ minHeight: '500px' }}>
            {activeTab === 'general' && (
              <>
                <SeoLivePreview slug={slug} />
                <GeneralTab />
              </>
            )}
            
            {activeTab === 'social' && (
              <SocialTab />
            )}

            {activeTab === 'schema' && (
              <SchemaTab />
            )}

            {activeTab === 'redirects' && (
              <RedirectsTab />
            )}

            {activeTab === 'sitemap' && (
              <SitemapTab />
            )}

            {activeTab === 'advanced' && (
              <AdvancedTab />
            )}

            {activeTab === 'analysis' && (
              <AnalysisTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
