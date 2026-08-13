"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaSave, FaTimes, FaImage, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { createPage } from "@/store/slices/pageSlice";
import { adminPath } from "@/utils/BaseUrl";
import toast from "react-hot-toast";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";
import { Media } from "@/services/media.service";

export default function CreatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    status: "published" | "draft";
    seo_title: string;
    seo_description: string;
    parent_id: number | null;
    featured_image_id: number | null;
    featured_image_url: string | null;
  }>({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
    parent_id: null,
    featured_image_id: null,
    featured_image_url: null,
  });

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectMedia = (media: Media | Media[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    setFormData({ 
      ...formData, 
      featured_image_id: item.id,
      featured_image_url: item.url 
    });
    setIsMediaModalOpen(false);
  };

  const removeFeaturedImage = () => {
    setFormData({ 
      ...formData, 
      featured_image_id: null,
      featured_image_url: null 
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    setFormData({ ...formData, title, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      
      await dispatch(createPage(formData)).unwrap();
      
      toast.success("Page created successfully!");
      router.push(`/${adminPath}/pages`);
    } catch (err: any) {
      const msg = err || "Failed to create page";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href={`/${adminPath}/pages`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <FaArrowLeft />
          </Link>
          <h2 className="fw-bold mb-0">Create New Page</h2>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 shadow-sm border-0">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="mb-0 fw-bold">Page Content</h5>
            </div>
            <div className="card-body p-4">
              <form id="create-page-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Page Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="e.g. Services"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">URL Slug</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 text-muted">/</span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="e.g. services"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Page Content</label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows={12}
                    placeholder="Enter page content or description..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* SEO SETTINGS */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="mb-0 fw-bold">SEO Optimization</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label className="form-label fw-semibold small text-uppercase text-muted">SEO Title</label>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Enter custom meta title..."
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold small text-uppercase text-muted">SEO Description</label>
                <textarea
                  className="form-control bg-light border-0"
                  rows={4}
                  placeholder="Enter meta description for search engines..."
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: "100px" }}>
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Publish Settings</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Status</label>
                  <select
                    className="form-select bg-light border-0"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    form="create-page-form"
                    className="btn btn-primary py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <FaSave />
                    )}
                    Publish Page
                  </button>
                  <Link href={`/${adminPath}/pages`} className="btn btn-light py-2 text-muted">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Featured Image</h5>
              </div>
              <div className="card-body p-4">
                {formData.featured_image_id ? (
                  <div className="position-relative">
                    <div className="rounded-4 overflow-hidden border shadow-sm" onClick={() => setIsMediaModalOpen(true)} style={{ cursor: 'pointer' }}>
                      <img src={formData.featured_image_url || ""} alt="Featured" className="w-100 h-auto d-block" />
                      <div className="p-2 bg-white text-center border-top small fw-medium text-primary">Change Image</div>
                    </div>
                    <button className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow" onClick={removeFeaturedImage}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer hover-bg-light transition-all" onClick={() => setIsMediaModalOpen(true)}>
                    <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-3">
                      <FaPlus size={24} />
                    </div>
                    <p className="small fw-bold mb-1">Select Featured Image</p>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.7rem' }}>Click to open media library</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Page Summary</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="small fw-bold text-uppercase text-muted d-block mb-1">Preview URL</label>
                  <div className="p-2 bg-light rounded text-primary font-monospace small text-truncate">
                    /{formData.slug || '...'}
                  </div>
                </div>
                <p className="small text-muted mb-0">
                  After creating the page, you will be able to manage its Advanced Custom Fields (ACF) to add structured content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectMedia}
        type="image"
        title="Select Featured Image"
      />
    </div>
  );
}

