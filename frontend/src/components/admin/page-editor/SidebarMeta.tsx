import React, { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMetadata } from "@/store/slices/editorSlice";
import { Image as ImageIcon, Settings, X, Plus } from "lucide-react";
import MediaLibraryModal from "../common/MediaLibraryModal";
import { Media } from "@/services/media.service";
import SeoSidebar from "../seo/SeoSidebar";

export default function SidebarMeta() {
  const dispatch = useAppDispatch();
  const { metadata } = useAppSelector((state) => state.editor);
  const [activeTab, setActiveTab] = useState<'page' | 'seo'>('page');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use featured_image_url for preview if available, with safety fallback for relative paths
  const previewUrl = useMemo(() => {
    if (!metadata.featured_image_url) return null;
    if (metadata.featured_image_url.startsWith('http')) return metadata.featured_image_url;
    // Fallback for relative paths
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${baseUrl}${metadata.featured_image_url}`;
  }, [metadata.featured_image_url]);

  const removeFeaturedImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setMetadata({
      featured_image_id: undefined,
      featured_image_url: undefined
    }));
  };

  const handleSelectMedia = (media: Media | Media[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    dispatch(setMetadata({ 
      featured_image_id: item.id,
      featured_image_url: item.url
    }));
    setIsModalOpen(false);
  };

  const handleUpdateMetadata = (data: any) => {
    dispatch(setMetadata(data));
  };

  return (
    <div className="bg-white border-start h-100 d-flex flex-column shadow-sm" style={{ width: "350px" }}>
      {/* Sidebar Tabs */}
      <div className="d-flex border-bottom bg-light">
        <button 
          className={`flex-grow-1 py-3 small fw-bold border-0 border-bottom border-3 transition-all ${activeTab === 'page' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted'}`}
          onClick={() => setActiveTab('page')}
        >
          Page
        </button>
        <button 
          className={`flex-grow-1 py-3 small fw-bold border-0 border-bottom border-3 transition-all ${activeTab === 'seo' ? 'border-primary text-primary bg-white' : 'border-transparent text-muted'}`}
          onClick={() => setActiveTab('seo')}
        >
          SEO
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
        {activeTab === 'page' ? (
          <div className="d-flex flex-column gap-5">
            {/* PAGE SETTINGS */}
            <section>
              <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                <Settings size={18} />
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Page Settings
                </h6>
              </div>
              
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Internal Page Name</label>
                <input 
                  type="text" 
                  className="form-control form-control-sm"
                  placeholder="e.g. About Us (Internal)"
                  value={metadata.title}
                  onChange={(e) => handleUpdateMetadata({ title: e.target.value })}
                />
                <div className="x-small text-muted mt-1">Used for administrative listings only.</div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">URL Slug</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted">/</span>
                  <input 
                    type="text" 
                    className="form-control"
                    value={metadata.slug}
                    onChange={(e) => handleUpdateMetadata({ slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label small fw-semibold text-muted">Status</label>
                <select 
                  className="form-select form-select-sm"
                  value={metadata.status}
                  onChange={(e) => handleUpdateMetadata({ status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </section>

            {/* FEATURED IMAGE */}
            <section>
              <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                <ImageIcon size={18} />
                <h6 className="mb-0 fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Featured Image
                </h6>
              </div>
              
              {metadata.featured_image_id ? (
                <div className="position-relative">
                  <div className="border rounded-4 overflow-hidden shadow-sm bg-light">
                    <div className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ aspectRatio: '16/9' }}>
                       {previewUrl ? (
                         <img src={previewUrl} alt="Featured" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                       ) : (
                         <ImageIcon size={48} className="text-muted opacity-25" />
                       )}
                    </div>
                    <div className="p-3 bg-white border-top">
                      <button 
                        className="btn btn-sm btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow"
                    onClick={removeFeaturedImage}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  className="border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer hover-bg-light transition-all"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-3">
                    <Plus size={24} />
                  </div>
                  <p className="small fw-bold mb-1">Select Featured Image</p>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.7rem' }}>Click to open media library</p>
                </div>
              )}
            </section>

            <MediaLibraryModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSelect={handleSelectMedia}
              type="image"
              title="Select Featured Image"
            />
          </div>
        ) : (
          <SeoSidebar />
        )}
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6 !important;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .border-transparent {
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
