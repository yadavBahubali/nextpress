"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  Loader2, 
  ExternalLink,
  MapPin,
  ChevronDown,
  ChevronUp,
  Settings2,
  AlertCircle,
  FileCode,
  Copy
} from "lucide-react";
import { seoService, SeoMeta } from "@/services/seo.service";
import toast from "react-hot-toast";

interface SitemapEntry {
  entity_id: number;
  entity_type: string;
  title?: string;
  slug: string;
  updated_at: string;
  sitemap_include: boolean | number;
  sitemap_priority: number;
  sitemap_changefreq: string;
  is_noindex?: boolean;
}

export default function SitemapEditor() {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeDomain, setActiveDomain] = useState("Loading...");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [rawXml, setRawXml] = useState("");
  const [data, setData] = useState<{
    pages: SitemapEntry[];
    posts: SitemapEntry[];
    customUrls: SitemapEntry[];
  }>({
    pages: [],
    posts: [],
    customUrls: []
  });

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newCustom, setNewCustom] = useState({
    slug: '',
    priority: 0.5,
    changefreq: 'monthly'
  });

  useEffect(() => {
    fetchEntries();
    fetchDomain();
  }, []);

  const fetchDomain = async () => {
    try {
      const res = await seoService.getGlobalSeo();
      // site_domain might be in globalSeo or need a dedicated fetch
      // but for now, we can show it here
      setActiveDomain(res.data?.site_domain || "https://www.nextpress.in");
    } catch (e) {
      setActiveDomain("https://www.nextpress.in");
    }
  }

  const handleSyncFiles = async () => {
    setIsSyncing(true);
    try {
      await seoService.generateSeoFiles();
      toast.success("SEO files (sitemap & robots) synced to public folder");
      fetchEntries();
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await seoService.getSitemapEntries();
      if (res.status === 'success' && res.data) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("Failed to load sitemap entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchRawXml = async () => {
    try {
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const text = await response.text();
        setRawXml(text);
        setShowRaw(true);
      } else {
        toast.error("Sitemap file not found on server yet. Try generating it first.");
      }
    } catch (error) {
      toast.error("Could not fetch raw sitemap");
    }
  };

  const handleUpdate = async (entry: SitemapEntry, field: string, value: any) => {
    const saveKey = `${entry.entity_type}-${entry.entity_id}`;
    setSavingId(saveKey);
    
    try {
      const updatedData: any = {
        ...entry,
        [field]: value,
        entity_id: entry.entity_id,
        entity_type: entry.entity_type
      };

      // Ensure boolean conversion for MySQL bit/tinyint
      if (field === 'sitemap_include') {
        updatedData.sitemap_include = !!value;
      }

      await seoService.upsertSeo(entry.entity_type, entry.entity_id, updatedData);
      
      // Update local state
      const category = entry.entity_type === 'page' ? 'pages' : entry.entity_type === 'blog' ? 'posts' : 'customUrls';
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [category]: prev[category as keyof typeof prev]?.map(item => 
            (item.entity_id === entry.entity_id && item.entity_type === entry.entity_type) 
              ? { ...item, [field]: value } 
              : item
          ) || []
        };
      });

      toast.success("Updated successfully");
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleAddCustom = async () => {
    if (!newCustom.slug) {
      toast.error("URL path is required");
      return;
    }

    setLoading(true);
    try {
      const res = await seoService.upsertSeo('custom_url', null, {
        source_path: newCustom.slug,
        sitemap_include: true,
        sitemap_priority: newCustom.priority,
        sitemap_changefreq: newCustom.changefreq
      });

      toast.success("Custom URL added to sitemap");
      setIsAddingCustom(false);
      setNewCustom({ slug: '', priority: 0.5, changefreq: 'monthly' });
      fetchEntries();
    } catch (error) {
      toast.error("Failed to add custom URL");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustom = async (id: number) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (!result.isConfirmed) return;
    
    try {
      await seoService.deleteSeoById(id);
      toast.success("Removed");
      fetchEntries();
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawXml);
    toast.success("Copied to clipboard");
  };

  const renderTable = (entries: SitemapEntry[] = [], title: string) => (
    <div className="mb-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
          {title === 'Pages' ? <Globe size={18} className="text-primary" /> : title === 'Blog Posts' ? <MapPin size={18} className="text-success" /> : <Plus size={18} className="text-dark" />}
          {title} <span className="badge bg-light text-muted border ms-2">{entries?.length || 0}</span>
        </h6>
      </div>
      <div className="table-responsive border rounded-4 overflow-hidden shadow-sm bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 small text-uppercase fw-bold text-muted border-0">Path / Title</th>
              <th className="py-3 px-4 small text-uppercase fw-bold text-muted border-0 text-center" style={{ width: '120px' }}>In Sitemap</th>
              <th className="py-3 px-4 small text-uppercase fw-bold text-muted border-0" style={{ width: '150px' }}>Priority</th>
              <th className="py-3 px-4 small text-uppercase fw-bold text-muted border-0" style={{ width: '180px' }}>Frequency</th>
              {title === 'Custom URLs' && <th className="py-3 px-4 small text-uppercase fw-bold text-muted border-0 text-end" style={{ width: '100px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {!entries || entries.length === 0 ? (
              <tr>
                <td colSpan={title === 'Custom URLs' ? 5 : 4} className="text-center py-4 text-muted small">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const saveKey = `${entry.entity_type}-${entry.entity_id}`;
                const isSaving = savingId === saveKey;

                return (
                  <tr key={saveKey}>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark small">{entry.title || entry.slug}</span>
                        <code className="text-muted x-small mt-1">{entry.slug === 'home' ? '/' : entry.slug.startsWith('/') ? entry.slug : `/${entry.slug}`}</code>
                        {entry.is_noindex && <span className="badge bg-danger-subtle text-danger x-small mt-1" style={{ width: 'fit-content' }}>Noindex Active</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="form-check form-switch d-flex justify-content-center p-0">
                        <input 
                          className="form-check-input ms-0 shadow-none cursor-pointer" 
                          type="checkbox" 
                          checked={!!entry.sitemap_include}
                          onChange={(e) => handleUpdate(entry, 'sitemap_include', e.target.checked)}
                          disabled={isSaving}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        className="form-select form-select-sm border-0 bg-light shadow-none fw-medium"
                        value={entry.sitemap_priority}
                        onChange={(e) => handleUpdate(entry, 'sitemap_priority', parseFloat(e.target.value))}
                        disabled={isSaving}
                      >
                        <option value="1.0">1.0 (Critical)</option>
                        <option value="0.9">0.9</option>
                        <option value="0.8">0.8 (High)</option>
                        <option value="0.7">0.7</option>
                        <option value="0.6">0.6</option>
                        <option value="0.5">0.5 (Normal)</option>
                        <option value="0.4">0.4</option>
                        <option value="0.3">0.3 (Low)</option>
                        <option value="0.2">0.2</option>
                        <option value="0.1">0.1</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        className="form-select form-select-sm border-0 bg-light shadow-none fw-medium text-capitalize"
                        value={entry.sitemap_changefreq}
                        onChange={(e) => handleUpdate(entry, 'sitemap_changefreq', e.target.value)}
                        disabled={isSaving}
                      >
                        {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </td>
                    {title === 'Custom URLs' && (
                      <td className="py-3 px-4 text-end">
                        <button 
                          className="btn btn-sm btn-light border p-2 rounded-circle text-danger hover-shadow"
                          onClick={() => handleDeleteCustom(entry.entity_id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && (!data || !data.pages || data.pages.length === 0)) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="sitemap-editor">
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
              <RefreshCw size={24} className={isSyncing ? "animate-spin" : ""} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">Public File Sync</h6>
              <p className="x-small text-muted mb-0 d-flex align-items-center gap-1">
                Active Domain: <code className="text-primary fw-bold bg-light px-2 py-1 rounded">{activeDomain}</code>
              </p>
            </div>
          </div>
          <button 
            className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
            onClick={handleSyncFiles}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sync & Refresh SEO Files
          </button>
        </div>
      </div>

      <div className="alert alert-info border-0 rounded-4 p-4 d-flex gap-4 mb-5 shadow-sm">
        <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle h-100">
          <Settings2 size={24} />
        </div>
        <div>
          <h6 className="fw-bold mb-2">Master Sitemap Configuration</h6>
          <p className="small mb-0 opacity-75">
            Manage exactly which pages appear in your <code>sitemap.xml</code>. 
            You can override priorities and frequencies for specific pages or add manual links that aren't managed by the CMS.
          </p>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-3 mb-4">
        <button 
          className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
          onClick={fetchRawXml}
        >
          <FileCode size={16} /> View Raw XML
        </button>
        <button 
          className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setIsAddingCustom(true)}
        >
          <Plus size={16} /> Add Custom URL
        </button>
      </div>

      {showRaw && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 p-4">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FileCode size={18} /> sitemap.xml Raw Content
                </h6>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowRaw(false)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                <div className="position-relative">
                  <button 
                    className="btn btn-sm btn-light border position-absolute top-0 end-0 m-2 z-1"
                    onClick={copyToClipboard}
                  >
                    <Copy size={14} />
                  </button>
                  <pre className="bg-dark text-success p-4 rounded-4 small overflow-auto" style={{ maxHeight: '400px' }}>
                    {rawXml}
                  </pre>
                </div>
                <div className="alert alert-warning border-0 small mt-3 mb-0">
                  This is the actual content currently saved in <code>frontend/public/sitemap.xml</code>.
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-light border px-4 rounded-pill fw-bold" onClick={() => setShowRaw(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingCustom && (
        <div className="card border-primary border-2 rounded-4 p-4 mb-5 shadow-sm bg-primary bg-opacity-5">
          <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <Plus size={18} /> Add Standalone Sitemap URL
          </h6>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label x-small fw-bold text-uppercase text-muted">URL Path (relative)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. /custom-landing-page"
                value={newCustom.slug}
                onChange={(e) => setNewCustom({...newCustom, slug: e.target.value})}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label x-small fw-bold text-uppercase text-muted">Priority</label>
              <select 
                className="form-select"
                value={newCustom.priority}
                onChange={(e) => setNewCustom({...newCustom, priority: parseFloat(e.target.value)})}
              >
                <option value="1.0">1.0</option>
                <option value="0.8">0.8</option>
                <option value="0.5">0.5</option>
                <option value="0.3">0.3</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label x-small fw-bold text-uppercase text-muted">Frequency</label>
              <select 
                className="form-select"
                value={newCustom.changefreq}
                onChange={(e) => setNewCustom({...newCustom, changefreq: e.target.value})}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary flex-grow-1" onClick={handleAddCustom}>Add</button>
              <button className="btn btn-light border" onClick={() => setIsAddingCustom(false)}><X size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {data?.pages && renderTable(data.pages, 'Pages')}
      {data?.posts && renderTable(data.posts, 'Blog Posts')}
      {data?.customUrls && renderTable(data.customUrls, 'Custom URLs')}

      <style jsx>{`
        .x-small { font-size: 0.7rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cursor-pointer { cursor: pointer; }
        .hover-shadow:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
      `}</style>
    </div>
  );
}
