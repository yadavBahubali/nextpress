
"use client";
// app/[admin]/media/page.tsx
import Swal from 'sweetalert2';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, Search, Grid, List as ListIcon, 
  Filter, Image as ImageIcon, File, Video, 
  X, Info, Trash2, Download, Save, Loader2,
  ExternalLink, FileText, ChevronRight, CheckCircle
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMedia, uploadMedia, updateMedia, deleteMedia } from "@/store/slices/mediaSlice";
import { mediaService, Media } from "@/services/media.service";
import toast from "react-hot-toast";

export default function MediaLibraryPage() {
  const dispatch = useAppDispatch();
  const { items: mediaItems, isLoading, isUploading, isSaving, error } = useAppSelector((state) => state.media);
  
  const [selectedItems, setSelectedItems] = useState<Media[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "file">("all");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The item currently being inspected in the sidebar is the most recently selected one
  const activeItem = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : null;

  // Detail sidebar fields
  const [meta, setMeta] = useState({
    original_name: "",
    alt_text: "",
    caption: "",
    description: ""
  });

  const fetchItems = useCallback(() => {
    dispatch(fetchMedia({ 
      search, 
      type: typeFilter === "all" ? undefined : typeFilter 
    }));
  }, [dispatch, search, typeFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (activeItem) {
      setMeta({
        original_name: activeItem.original_name || "",
        alt_text: activeItem.alt_text || "",
        caption: activeItem.caption || "",
        description: activeItem.description || ""
      });
    }
  }, [activeItem]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append("files", file);
    });

    dispatch(uploadMedia(formData))
      .unwrap()
      .then(() => toast.success("Upload successful"))
      .catch((err) => toast.error(err || "Upload failed"));
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateMeta = async () => {
    if (!activeItem) return;

    dispatch(updateMedia({ id: activeItem.id, data: meta }))
      .unwrap()
      .then(() => {
        toast.success("Metadata updated");
        setSelectedItems(prev => prev.map(item => item.id === activeItem.id ? { ...item, ...meta } : item));
      })
      .catch((err) => toast.error(err || "Failed to update"));
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;

    dispatch(deleteMedia(id))
      .unwrap()
      .then(() => {
        toast.success("Item deleted");
        setSelectedItems(prev => prev.filter(item => item.id !== id));
      })
      .catch((err) => toast.error(err || "Delete failed"));
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedItems.length} items. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    });
    if (!result.isConfirmed) return;

    const idsToDelete = selectedItems.map(item => item.id);
    const loadingToast = toast.loading(`Deleting ${selectedItems.length} items...`);

    try {
      let successCount = 0;
      let failCount = 0;

      await Promise.all(
        idsToDelete.map(async (id) => {
          try {
            await mediaService.delete(id);
            successCount++;
          } catch (err) {
            failCount++;
          }
        })
      );

      toast.dismiss(loadingToast);
      if (failCount === 0) {
        toast.success(`Successfully deleted ${successCount} items`);
      } else {
        toast.error(`Deleted ${successCount} items, failed to delete ${failCount} items`);
      }
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred during bulk deletion");
    }
  };

  const toggleSelection = (item: Media) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === mediaItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaItems);
    }
  };

  const getIcon = (type: string) => {
    if (!type) return <File size={20} />;
    if (type.includes("image")) return <ImageIcon size={20} />;
    if (type.includes("video")) return <Video size={20} />;
    return <File size={20} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="media-library bg-light min-vh-100 pb-5">
      {/* HEADER SECTION */}
      <div className="bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 10 }}>
        <div className="container-fluid py-3 px-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
                <ImageIcon className="text-primary" /> Media Library
              </h1>
              <p className="text-muted small mb-0">Manage and organize your digital assets</p>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <input 
                type="file" 
                multiple 
                className="d-none" 
                ref={fileInputRef} 
                onChange={handleUpload}
              />
              <button 
                className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {isUploading ? "Uploading..." : "Upload New"}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="container-fluid py-2 px-4 bg-light border-top">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
              <Search className="position-absolute text-muted" size={16} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-control ps-5 bg-white border-0 shadow-sm rounded-3" 
                placeholder="Search media files..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="d-flex bg-white rounded-3 shadow-sm p-1">
              <button 
                className={`btn btn-sm px-3 rounded-2 ${typeFilter === 'all' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setTypeFilter('all')}
              >
                All
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-2 ${typeFilter === 'image' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setTypeFilter('image')}
              >
                Images
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-2 ${typeFilter === 'video' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setTypeFilter('video')}
              >
                Videos
              </button>
              <button 
                className={`btn btn-sm px-3 rounded-2 ${typeFilter === 'file' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                onClick={() => setTypeFilter('file')}
              >
                Documents
              </button>
            </div>

            {mediaItems.length > 0 && (
              <div className="d-flex align-items-center gap-2 ms-md-auto">
                <button 
                  className={`btn btn-sm px-3 rounded-2 ${selectedItems.length === mediaItems.length ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === mediaItems.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedItems.length > 0 && (
                  <button 
                    className="btn btn-sm btn-danger px-3 rounded-2 d-flex align-items-center gap-1 shadow-sm animate-fade-in"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={14} /> Delete Selected ({selectedItems.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        <div className="row g-4">
          {/* MEDIA GRID */}
          <div className={`${activeItem ? 'col-lg-8 col-xl-9' : 'col-12'} transition-all`}>
            {isLoading && mediaItems.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <Loader2 className="animate-spin text-primary mb-3" size={48} />
                <p className="text-muted fw-medium">Scanning media vault...</p>
              </div>
            ) : mediaItems.length > 0 ? (
              <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
                {mediaItems.map((item) => {
                  const isSelected = selectedItems.some(i => i.id === item.id);
                  return (
                    <div key={item.id} className="col">
                      <div 
                        className={`media-card bg-white rounded-4 border overflow-hidden cursor-pointer h-100 position-relative group ${isSelected ? 'border-primary border-2 shadow' : 'border-0 shadow-sm'}`}
                        onClick={() => toggleSelection(item)}
                        style={{ borderWidth: isSelected ? '2px' : '1px' }}
                      >
                        <div className="aspect-ratio-box bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ aspectRatio: '1/1' }}>
                          {item.mime_type?.includes("image") ? (
                            <img 
                              src={item.url} 
                              alt={item.alt_text || item.original_name} 
                              className="w-100 h-100 object-fit-cover transition-transform group-hover-scale"
                            />
                          ) : (
                            <div className="text-primary opacity-50">
                              {getIcon(item.mime_type)}
                            </div>
                          )}
                          
                          <div className="overlay-badge position-absolute top-0 end-0 p-2 opacity-0 group-hover-opacity-100 transition-all" style={{ zIndex: 2 }}>
                            <div className="bg-primary text-white p-1 rounded-circle shadow-sm">
                              <Info size={16} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2 border-top">
                          <p className="text-truncate small mb-0 fw-medium text-dark">{item.original_name}</p>
                          <p className="text-muted x-small mb-0 uppercase ls-1">{item.mime_type?.split('/')[1] || 'FILE'}</p>
                        </div>

                        {isSelected && (
                          <div className="position-absolute top-0 start-0 p-1.5 bg-primary text-white rounded-bottom-end shadow animate-fade-in" style={{ borderTopLeftRadius: 'inherit', zIndex: 2 }}>
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
                <div className="bg-light p-4 rounded-circle d-inline-flex mb-4">
                  <ImageIcon size={64} className="text-muted opacity-50" />
                </div>
                <h3 className="h5 fw-bold text-dark">Your Media Vault is Empty</h3>
                <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '350px' }}>
                  Start uploading assets to build your professional media library. We support images, videos, and documents.
                </p>
                <button className="btn btn-primary rounded-pill px-5 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                  Upload First Asset
                </button>
              </div>
            )}
          </div>

          {/* DETAIL SIDEBAR */}
          {activeItem && (
            <div className="col-lg-4 col-xl-3 animate-slide-in">
              <div className="card border-0 shadow-lg rounded-4 sticky-top overflow-hidden" style={{ top: '160px' }}>
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Info size={20} className="text-primary" /> Asset Properties
                  </h6>
                  <button className="btn btn-link p-0 text-muted" onClick={() => setSelectedItems([])}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="detail-scroll custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                  <div className="p-3">
                    <div className="preview-container rounded-4 mb-4 bg-light overflow-hidden shadow-inner d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                       {activeItem.mime_type?.includes("image") ? (
                          <img src={activeItem.url} alt="Preview" className="w-100 h-auto" />
                       ) : (
                          <div className="text-center p-5">
                             <div className="bg-white p-4 rounded-circle shadow-sm d-inline-flex mb-3">
                                {getIcon(activeItem.mime_type)}
                             </div>
                             <p className="small fw-bold text-dark mb-0">{activeItem.original_name}</p>
                          </div>
                       )}
                    </div>

                    <div className="stats-grid row g-2 mb-4">
                      <div className="col-6">
                        <div className="bg-light p-2 rounded-3">
                          <p className="x-small text-muted mb-0 uppercase">Size</p>
                          <p className="small fw-bold mb-0">{(activeItem.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-light p-2 rounded-3">
                          <p className="x-small text-muted mb-0 uppercase">Uploaded</p>
                          <p className="small fw-bold mb-0">{formatDate(activeItem.created_at || "")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="form-group">
                        <label className="x-small fw-bold text-muted text-uppercase mb-2">Display Title</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-light border-0" 
                          value={meta.original_name}
                          onChange={(e) => setMeta({...meta, original_name: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="x-small fw-bold text-muted text-uppercase mb-2">Alt Text (SEO)</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-light border-0" 
                          placeholder="Describe the image..."
                          value={meta.alt_text}
                          onChange={(e) => setMeta({...meta, alt_text: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="x-small fw-bold text-muted text-uppercase mb-2">Caption</label>
                        <textarea 
                          className="form-control form-control-sm bg-light border-0" 
                          rows={2}
                          value={meta.caption}
                          onChange={(e) => setMeta({...meta, caption: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-light border-top p-3">
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary d-flex align-items-center justify-content-center gap-2" onClick={handleUpdateMeta} disabled={isSaving}>
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {isSaving ? "Syncing..." : "Update Metadata"}
                    </button>
                    <div className="d-flex gap-2">
                      <a href={activeItem.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                        <ExternalLink size={16} /> Open
                      </a>
                      <button className="btn btn-outline-danger px-3" onClick={() => handleDelete(activeItem.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .media-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .media-card:hover {
          transform: translateY(-4px);
        }
        .group:hover .group-hover-opacity-100 {
          opacity: 1 !important;
        }
        .group:hover .group-hover-scale {
          transform: scale(1.05);
        }
        .x-small { font-size: 0.7rem; }
        .uppercase { text-transform: uppercase; }
        .ls-1 { letter-spacing: 1px; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
}
