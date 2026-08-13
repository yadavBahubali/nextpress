"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { 
  Settings, 
  ArrowRightLeft, 
  Globe, 
  Terminal, 
  BarChart3, 
  Puzzle,
  Loader2
} from "lucide-react";
import { seoService, SeoMeta } from "@/services/seo.service";
import toast from "react-hot-toast";

// Re-organized Layout Components
import SeoHeader from "./_components/layout/SeoHeader";
import InsightSidebar from "./_components/layout/InsightSidebar";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";

// Re-organized Tab Components
import DefaultsTab from "./_components/tabs/DefaultsTab";
import RedirectsTab from "./_components/tabs/RedirectsTab";
import SitemapTab from "./_components/tabs/SitemapTab";
import RobotsTab from "./_components/tabs/RobotsTab";
import RedirectModal from "./_components/tabs/RedirectModal";

type SeoTab = 'defaults' | 'sitemap' | 'robots' | 'redirects' | 'analytics' | 'integrations';

export default function GlobalSeoSettings() {
  const [activeTab, setActiveTab] = useState<SeoTab>('defaults');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Defaults State
  const [globalSeo, setGlobalSeo] = useState<Partial<SeoMeta>>({
    entity_type: 'global',
    entity_id: null,
    meta_title: '',
    meta_description: '',
    og_image: '',
    schema_type: 'Organization',
    schema_json: {}
  });

  // Redirects State
  const [redirects, setRedirects] = useState<any[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [seoRes, redirectsRes] = await Promise.all([
        seoService.getGlobalSeo(),
        seoService.getRedirects()
      ]);
      
      if (seoRes.data) setGlobalSeo(seoRes.data);
      if (redirectsRes.data) setRedirects(redirectsRes.data);
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      toast.error("Failed to load SEO settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'defaults') {
        await seoService.upsertSeo('global', null, globalSeo);
        toast.success("Global SEO settings saved and synced");
      }
      // Future tabs like Analytics or Integrations would save here too
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRedirect = async (id: number) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (!result.isConfirmed) return;
    
    try {
      await seoService.deleteSeoById(id);
      toast.success("Redirect deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete redirect");
    }
  };

  const navTabs: { id: SeoTab; label: string; icon: any }[] = [
    { id: 'defaults', label: 'Global Defaults', icon: Settings },
    { id: 'sitemap', label: 'Sitemap Generator', icon: Globe },
    { id: 'robots', label: 'Robots.txt', icon: Terminal },
    { id: 'redirects', label: 'Redirects Manager', icon: ArrowRightLeft },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
  ];

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-light min-vh-100">
      <SeoHeader 
        isSaving={isSaving} 
        onSave={handleSaveAll} 
        showSave={activeTab === 'defaults'} 
      />

      <div className="row g-4">
        {/* Main Workspace Area (Col 9) */}
        <div className="col-lg-9">
          {/* Navigation Bar */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-header bg-white border-0 p-0">
              <ul className="nav nav-tabs border-0 flex-nowrap overflow-auto scrollbar-hidden">
                {navTabs.map(tab => (
                  <li key={tab.id} className="nav-item">
                    <button 
                      className={`nav-link border-0 py-3 px-4 fw-bold d-flex align-items-center gap-2 white-space-nowrap ${activeTab === tab.id ? 'active text-primary border-bottom border-primary border-3' : 'text-muted opacity-75'}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="workspace-canvas">
            {activeTab === 'defaults' && (
              <DefaultsTab 
                globalSeo={globalSeo} 
                setGlobalSeo={setGlobalSeo} 
                onSelectMedia={() => setIsMediaModalOpen(true)} 
              />
            )}
            {activeTab === 'redirects' && (
              <RedirectsTab 
                redirects={redirects} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                onAdd={() => setIsRedirectModalOpen(true)}
                onDelete={handleDeleteRedirect}
              />
            )}
            {activeTab === 'sitemap' && <SitemapTab />}
            {activeTab === 'robots' && <RobotsTab />}
            
            {(activeTab === 'analytics' || activeTab === 'integrations') && (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="bg-light d-inline-flex p-4 rounded-circle mb-4">
                  <Puzzle size={48} className="text-muted" />
                </div>
                <h4 className="fw-bold">Coming Soon</h4>
                <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
                  We are building deep integrations with Google Search Console and GA4 to bring your data directly into the CMS.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Insight Sidebar (Col 3) */}
        <div className="col-lg-3">
          <InsightSidebar />
        </div>
      </div>

      {/* Modals */}
      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(m) => setGlobalSeo({...globalSeo, og_image: Array.isArray(m) ? m[0].url : m.url})}
      />

      <RedirectModal 
        isOpen={isRedirectModalOpen}
        onClose={() => setIsRedirectModalOpen(false)}
        onSuccess={fetchData}
      />

      <style jsx>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .white-space-nowrap { white-space: nowrap; }
        .nav-tabs .nav-link { transition: all 0.2s ease-in-out; border-radius: 0; }
        .nav-tabs .nav-link:hover:not(.active) { background-color: #f8f9fa; }
        .nav-tabs .nav-link.active { background-color: transparent !important; }
      `}</style>
    </div>
  );
}

