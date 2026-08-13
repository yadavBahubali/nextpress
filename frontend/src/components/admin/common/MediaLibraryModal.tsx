"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Upload, Search, CheckCircle, File, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { mediaService, Media } from "@/services/media.service";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media | Media[]) => void;
  allowMultiple?: boolean;
  type?: "image" | "video" | "file" | "all";
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false,
  type = "all",
  title = "Media Library"
}: Props) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [selectedItems, setSelectedItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await mediaService.getAll({ 
        search, 
        type: type === "all" ? undefined : type 
      });
      setMediaItems(response.data || []);
    } catch (error) {
      console.error("Fetch Media Error:", error);
      toast.error("Failed to load media items");
    } finally {
      setIsLoading(false);
    }
  }, [search, type]);

  useEffect(() => {
    if (isOpen && activeTab === "library") {
      fetchMedia();
    }
  }, [isOpen, activeTab, fetchMedia]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileList = Array.from(files);
      
      // Map modal type to service upload type
      const uploadType = type === "all" ? "file" : type;
      const response = await mediaService.upload(fileList, uploadType as any);
      
      if (response.success) {
        const count = Array.isArray(response.data) ? response.data.length : 1;
        toast.success(`Uploaded ${count} file(s) successfully`);
        
        if (!allowMultiple) {
          const item = Array.isArray(response.data) ? response.data[0] : response.data;
          onSelect(item);
          onClose();
        } else {
          setActiveTab("library");
          fetchMedia();
          // Auto-select the new ones
          const newItems = Array.isArray(response.data) ? response.data : [response.data];
          setSelectedItems(prev => [...prev, ...newItems]);
        }
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      const msg = error.response?.data?.message || error.message || "Failed to upload file";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelection = (item: Media) => {
    if (!allowMultiple) {
      setSelectedItems([item]);
      return;
    }

    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleInsert = () => {
    if (selectedItems.length === 0) return;
    onSelect(allowMultiple ? selectedItems : selectedItems[0]);
    onClose();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    
    try {
      await mediaService.delete(id);
      setMediaItems(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete these ${selectedItems.length} items? This cannot be undone.`)) return;

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
      setMediaItems(prev => prev.filter(item => !idsToDelete.includes(item.id)));
      setSelectedItems([]);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete items");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="media-library-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center animate-fade-in-bg" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="media-library-container bg-white rounded-4 shadow-lg d-flex flex-column overflow-hidden animate-slide-up" style={{ width: '90%', maxWidth: '1200px', height: '85vh' }}>
        {/* HEADER */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
          <h5 className="mb-0 fw-bold">{title}</h5>
          <button className="btn btn-link p-1 text-muted" onClick={onClose}><X size={24} /></button>
        </div>

        {/* TABS & SEARCH */}
        <div className="px-3 border-bottom d-flex align-items-center justify-content-between bg-white">
          <div className="nav nav-tabs border-0">
            <button 
              className={`nav-link border-0 border-bottom border-3 py-3 px-4 fw-medium ${activeTab === 'upload' ? 'active border-primary text-primary' : 'text-muted border-transparent'}`}
              onClick={() => setActiveTab('upload')}
              style={{ background: 'transparent', marginBottom: '-1px' }}
            >
              Upload Files
            </button>
            <button 
              className={`nav-link border-0 border-bottom border-3 py-3 px-4 fw-medium ${activeTab === 'library' ? 'active border-primary text-primary' : 'text-muted border-transparent'}`}
              onClick={() => setActiveTab('library')}
              style={{ background: 'transparent', marginBottom: '-1px' }}
            >
              Media Library
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="position-relative" style={{ width: '250px' }}>
              <Search className="position-absolute top-50 translate-middle-y start-0 ms-3 text-muted" size={16} />
              <input 
                type="text" 
                className="form-control form-control-sm ps-5 bg-light border-0 rounded-pill" 
                placeholder="Search media..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-grow-1 overflow-hidden bg-light d-flex">
          {/* MAIN GRID AREA */}
          <div className="flex-grow-1 overflow-auto p-4">
            {activeTab === 'upload' ? (
              <div className="h-100 d-flex align-items-center justify-content-center">
                <div className="text-center p-5 border border-2 border-dashed rounded-4 bg-white" style={{ maxWidth: '400px', width: '100%' }}>
                  {uploading ? (
                    <div className="py-4">
                      <Loader2 className="animate-spin text-primary mx-auto mb-3" size={48} />
                      <p className="fw-bold mb-0">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary-subtle text-primary p-4 rounded-circle d-inline-block mb-4">
                        <Upload size={48} />
                      </div>
                      <h4 className="fw-bold mb-2">Drop files to upload</h4>
                      <p className="text-muted small mb-4">Maximum upload file size: 64 MB.</p>
                      <button 
                        className="btn btn-primary rounded-pill px-5 cursor-pointer"
                        onClick={handleUploadClick}
                      >
                        Select Files
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="d-none" 
                        multiple 
                        onChange={handleFileChange} 
                        accept={type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*'} 
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="media-grid d-grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {isLoading ? (
                  <div className="col-12 py-5 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="col-12 py-5 text-center text-muted">
                    <ImageIcon size={48} strokeWidth={1} className="mb-3 opacity-50" />
                    <p>No media files found</p>
                  </div>
                ) : (
                  mediaItems.map(item => {
                    const isSelected = selectedItems.some(i => i.id === item.id);
                    const isImg = item.mime_type.startsWith('image/');
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`media-item-card position-relative border rounded-3 overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg ring-primary' : 'bg-white shadow-sm border-transparent'}`}
                        onClick={() => toggleSelection(item)}
                        style={{ aspectRatio: '1/1', borderWidth: isSelected ? '3px' : '1px' }}
                      >
                        {isImg ? (
                          <img src={item.url} alt={item.original_name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white p-2 text-center">
                            {item.thumbnail_url ? (
                               <img src={item.thumbnail_url} alt="thumb" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                            ) : (
                               <File size={32} className="text-primary mb-2" />
                            )}
                            <span className="x-small text-muted text-center text-truncate w-100 px-1">{item.original_name}</span>
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="position-absolute top-0 end-0 p-1 bg-primary text-white rounded-bottom-start shadow">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* SIDE PREVIEW PANEL */}
          {activeTab === 'library' && (
            <div className="media-preview-sidebar bg-white border-start overflow-auto" style={{ width: '300px' }}>
              {selectedItems.length > 0 ? (
                <div className="p-3">
                  <h6 className="fw-bold mb-3 pb-2 border-bottom">Attachment Details</h6>
                  
                  {/* Show the last selected item's details */}
                  {(() => {
                    const item = selectedItems[selectedItems.length - 1];
                    const isImg = item.mime_type.startsWith('image/');
                    return (
                      <>
                        <div className="preview-image-container bg-light rounded border mb-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ aspectRatio: '16/10' }}>
                          {isImg ? (
                            <img src={item.url} alt="preview" className="img-fluid" style={{ maxHeight: '100%' }} />
                          ) : item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="preview" className="img-fluid" style={{ maxHeight: '100%' }} />
                          ) : (
                            <File size={48} className="text-muted opacity-50" />
                          )}
                        </div>
                        
                        <div className="detail-item mb-2">
                          <label className="x-small text-uppercase text-muted fw-bold d-block">File name</label>
                          <div className="small text-truncate fw-medium" title={item.original_name}>{item.original_name}</div>
                        </div>
                        
                        <div className="detail-item mb-2">
                          <label className="x-small text-uppercase text-muted fw-bold d-block">File type</label>
                          <div className="small">{item.mime_type}</div>
                        </div>
                        
                        <div className="detail-item mb-2">
                          <label className="x-small text-uppercase text-muted fw-bold d-block">File size</label>
                          <div className="small">{(item.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>

                        {item.dimensions && (
                          <div className="detail-item mb-3">
                            <label className="x-small text-uppercase text-muted fw-bold d-block">Dimensions</label>
                            <div className="small">{item.dimensions}</div>
                          </div>
                        )}

                        <hr />
                        
                        {selectedItems.length > 1 ? (
                          <button 
                            className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
                            onClick={handleBulkDelete}
                          >
                            <Trash2 size={14} /> Delete Selected ({selectedItems.length})
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={14} /> Delete Permanently
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 text-muted">
                  <ImageIcon size={48} strokeWidth={1} className="mb-3 opacity-20" />
                  <p className="small mb-0">Select an item to view its details and properties.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-top bg-white d-flex align-items-center justify-content-between">
          <div className="text-muted small">
            {selectedItems.length > 0 ? `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected` : 'No items selected'}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
            <button 
              className="btn btn-primary rounded-pill px-5" 
              disabled={selectedItems.length === 0}
              onClick={handleInsert}
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .media-item-card {
          transition: transform 0.2s, border-color 0.2s;
        }
        .media-item-card:hover {
          transform: translateY(-2px);
        }
        .border-transparent {
          border-color: transparent !important;
        }
        .ring-inset {
          box-shadow: inset 0 0 0 3px #0d6efd;
        }
        .x-small {
          font-size: 0.7rem;
        }
        .bg-gradient-dark-transparent {
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
        }
        .item-actions {
          transition: opacity 0.2s;
        }
        .media-item-card:hover .item-actions {
          opacity: 1 !important;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-fade-in-bg {
          animation: fadeInBg 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes fadeInBg {
          from { background-color: rgba(0,0,0,0); }
          to { background-color: rgba(0,0,0,0.5); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
