"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  ImageIcon,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Hash,
  Globe,
  FileText,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Layout,
  Edit3,
  AlertTriangle,
  Settings,
  MessageSquare,
  Trash2
} from "lucide-react";
import { blogsService, Post } from "@/services/blogs.service";
import { categoriesService, BlogCategory } from "@/services/categories.service";
import { authService } from "@/services/auth.service";
import { acfService } from "@/services/acf.service";
import { Media } from "@/services/media.service";
import { settingsService } from "@/services/settings.service";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setFieldGroups,
  setContent as setEditorContent,
  resetEditor,
} from "@/store/slices/editorSlice";
import { setVariables, resetSeo, saveSeo } from "@/store/slices/seoSlice";
import toast from "react-hot-toast";
import WysiwygField from "../page-editor/fields/WysiwygField";
import MediaLibraryModal from "../common/MediaLibraryModal";
import SectionList from "../page-editor/SectionList";
import AuthorProfileModal from "./AuthorProfileModal";
import SeoPanel from "../seo/SeoPanel";
import SeoSidebar from "../seo/SeoSidebar";

interface Props {
  postId?: string | number;
  onSave?: (post: Post) => void;
  adminPath: string;
}

export default function BlogEditor({ postId, onSave, adminPath }: Props) {
  const dispatch = useAppDispatch();
  const { seoData } = useAppSelector((state) => state.seo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [isMediaModalOpen, setIsModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "settings" | "author" | "acf" | "seo"
  >("settings");


  // Local Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    "draft",
  );
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState<Media | null>(null);
  const [heroImage, setHeroImage] = useState<Media | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);

  // Modal Control for Hero Image
  const [isHeroMediaModalOpen, setIsHeroMediaModalOpen] = useState(false);

  // New Author Flow
  const [showNewAuthorForm, setShowNewAuthorFlow] = useState(false);
  const [newAuthorData, setNewAuthorData] = useState({ name: "", email: "" });

  // Author details from backend (if available)
  const [authorDetails, setAuthorDetails] = useState<any>(null);

  // Sync variables to SEO store
  useEffect(() => {
    const currentSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    dispatch(
      setVariables({
        title: title || "",
        excerpt: excerpt || "",
        author: authors.find((a) => a.id === authorId)?.name || "",
        site_name: "NextPress",
        sep: "-",
        featured_image: featuredImage?.url || "",
        slug: currentSlug,
      }),
    );
  }, [title, excerpt, authorId, authors, featuredImage, slug, dispatch]);

  // Calculate reading time
  useEffect(() => {
    if (content) {
      const wordsPerMinute = 200;
      const text = content.replace(/<[^>]*>/g, ""); // Remove HTML
      const words = text.trim().split(/\s+/).length;
      const minutes = Math.ceil(words / wordsPerMinute);
      setReadingTime(minutes);
    } else {
      setReadingTime(0);
    }
  }, [content]);

  const fetchAuthors = async () => {
    try {
      const usersRes = await authService.getUsers();
      setAuthors(usersRes.data || []);
    } catch (err) {
      console.error("Error fetching authors:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch categories, tags & authors in parallel
        const [catsRes, tagsRes] = await Promise.all([
          categoriesService.getAll(),
          blogsService.getAllTags(),
          fetchAuthors(),
        ]);

        setCategories(catsRes.data || []);
        setTags(tagsRes.data || []);

        if (postId) {
          const res = await blogsService.getById(postId);
          const post = res.data;

          setTitle(post.title);
          setContent(post.content);
          setSlug(post.slug);
          setStatus(post.status);
          setExcerpt(post.excerpt || "");
          setAuthorId(post.author_id);
          setAuthorDetails(post.author_details);

          if (post.featured_image_id) {
            setFeaturedImage({
              id: post.featured_image_id,
              url: post.featured_image_url,
            } as any);
          }
          if (post.hero_image_id) {
            setHeroImage({
              id: post.hero_image_id,
              url: post.hero_image_url,
            } as any);
          }

          if (post.categories) {
            setSelectedCategories(post.categories.map((c: any) => c.id));
          }
          if (post.tags) {
            setSelectedTags(post.tags.map((t: any) => t.id));
          }

          setReadingTime(post.reading_time || 0);
          setShowToc(!!post.show_toc);

          // Handle FAQs from ACF
          if (post.acf && post.acf.faq_items) {
            setFaqItems(post.acf.faq_items);
          }

          // Fetch ACF Groups
          const acfGroups = await acfService.getGroupsForPost(postId);
          dispatch(
            setFieldGroups(
              acfGroups.map((g: any) => ({
                id: g.id.toString(),
                title: g.title,
                groupKey: g.group_key,
                fields: g.fields || [],
                settings: g.settings || {},
              })),
            ),
          );
          dispatch(setEditorContent(post.acf || {}));
        } else {
          // New post: apply writing defaults from Settings > Writing
          try {
            const [catSetting, statusSetting] = await Promise.all([
              settingsService.getSetting("writing_default_category"),
              settingsService.getSetting("writing_default_status"),
            ]);
            if (catSetting.success && catSetting.data) {
              const defaultCatId = parseInt(catSetting.data);
              if (!isNaN(defaultCatId)) {
                setSelectedCategories([defaultCatId]);
              }
            }
            if (statusSetting.success && statusSetting.data) {
              const s = statusSetting.data;
              if (s === "draft" || s === "published") {
                setStatus(s);
              }
            }
          } catch {
            // silently ignore — defaults already set via useState
          }
          dispatch(setFieldGroups([]));
          dispatch(setEditorContent({}));
        }
      } catch (err) {
        toast.error("Failed to load editor data");
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      dispatch(resetEditor());
      dispatch(resetSeo());
    };
  }, [postId, dispatch]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setSaving(true);
      const data = {
        title,
        content,
        slug,
        status,
        excerpt,
        featured_image_id: featuredImage?.id || undefined,
        hero_image_id: heroImage?.id || undefined,
        category_ids: selectedCategories,
        tag_ids: selectedTags,
        author_id: authorId || undefined,
        reading_time: readingTime,
        show_toc: showToc ? 1 : 0,
        acf: {
          faq_items: faqItems
        }
      };

      let finalPostId = postId;
      if (postId) {
        await blogsService.update(postId, data);
        toast.success("Post updated successfully");
      } else {
        const response = await blogsService.create(data);
        finalPostId = response.data.id;
        toast.success("Post created successfully");
        if (onSave) onSave(response.data);
      }

      if (seoData && finalPostId) {
        await dispatch(saveSeo({ entityType: "blog", entityId: finalPostId, data: seoData })).unwrap();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title to preview");
      return;
    }

    try {
      setSaving(true);
      const data = {
        title,
        content,
        slug,
        status,
        excerpt,
        featured_image_id: featuredImage?.id || undefined,
        hero_image_id: heroImage?.id || undefined,
        category_ids: selectedCategories,
        tag_ids: selectedTags,
        author_id: authorId || undefined,
        reading_time: readingTime,
        show_toc: showToc ? 1 : 0,
        acf: {
          faq_items: faqItems
        }
      };

      let currentId = postId;
      if (postId) {
        await blogsService.update(postId, data);
      } else {
        const response = await blogsService.create(data);
        currentId = response.data.id;
      }

      // Open preview in new tab
      window.open(`/blogs/preview/${currentId}`, '_blank');
      
      if (!postId && onSave && currentId) {
         onSave({ id: currentId as number } as any);
      }
    } catch (err: any) {
      toast.error("Failed to prepare preview");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewAuthor = async () => {
    if (!newAuthorData.name || !newAuthorData.email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setSaving(true);
      const res = await authService.createAuthor(newAuthorData);
      if (res.success && res.user) {
        toast.success("Author created successfully");
        await fetchAuthors();
        setAuthorId(res.user.id);
        setShowNewAuthorFlow(false);
        setIsAuthorModalOpen(true); // Open profile modal to complete info
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create author");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const existing = tags.find(
        (t) => t.name.toLowerCase() === tagInput.trim().toLowerCase(),
      );
      if (existing) {
        if (!selectedTags.includes(existing.id)) {
          setSelectedTags([...selectedTags, existing.id]);
        }
      } else {
        try {
          const res = await blogsService.createTag({ name: tagInput.trim() });
          setTags([...tags, res.data]);
          setSelectedTags([...selectedTags, res.data.id]);
        } catch (err) {
          toast.error("Failed to create tag");
        }
      }
      setTagInput("");
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-white">
        <div className="text-center">
          <Loader2
            className="animate-spin text-primary mb-3 mx-auto"
            size={48}
          />
          <p className="text-muted fw-medium">Hydrating Blog Editor...</p>
        </div>
      </div>
    );
  }

  const selectedAuthor = authors.find((a) => a.id === authorId);

  return (
    <div className="blog-editor-root vh-100 d-flex flex-column bg-light overflow-hidden">
      {/* TOPBAR */}
      <div
        className="px-4 py-3 bg-white border-bottom d-flex align-items-center justify-content-between sticky-top"
        style={{ zIndex: 1000, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center transition-all"
            onClick={() => window.history.back()}
          >
            <ChevronRight
              className="rotate-180"
              size={18}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
          <div className="vr h-25px opacity-10 mx-1"></div>
          <div>
            <h5 className="mb-0 fw-bold text-dark">
              {postId ? "Edit Enterprise Post" : "Create New Post"}
            </h5>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-10 text-primary x-small fw-bold px-2">
                BLOG MODULE
              </span>
              {postId && (
                <span className="text-muted x-small">ID: {postId}</span>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-medium transition-all hover-bg-light"
            onClick={handlePreview}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Preview"}
          </button>
          <button
            className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 transition-all"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 24px" }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} strokeWidth={2.5} />
            )}
            {postId ? "Update Post" : "Publish Story"}
          </button>
        </div>
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* MAIN AREA */}
        <div className="flex-grow-1 overflow-auto custom-scrollbar bg-white bg-opacity-50">
          <div className="mx-auto py-5 px-4" style={{ maxWidth: "1200px" }}>
            {/* HERO IMAGE SECTION */}
            <div className="mb-5 position-relative group">
              {heroImage ? (
                <div className="rounded-4 overflow-hidden border shadow-sm position-relative">
                  <img
                    src={heroImage.url}
                    alt="Hero"
                    className="w-100 d-block"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-50 backdrop-blur d-flex justify-content-between align-items-center">
                    <span className="text-white x-small fw-bold text-uppercase">
                      Post Hero Banner
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        className="btn   btn-light rounded-pill   fw-bold"
                        onClick={() => setIsHeroMediaModalOpen(true)}
                      >
                        Change
                      </button>
                      <button
                        className="btn  btn-danger rounded-pill    "
                        onClick={() => setHeroImage(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-4 p-5 text-center cursor-pointer hover-bg-light transition-all d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-30"
                  onClick={() => setIsHeroMediaModalOpen(true)}
                  style={{ minHeight: "200px" }}
                >
                  <div className="bg-white p-3 rounded-circle shadow-sm mb-3 text-primary">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">
                    Add Post Hero Image
                  </h6>
                  <p className="text-muted small mb-0">
                    High-resolution banner for the top of your article.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-muted fw-bold mb-1">Blog Title</label>

              {/* TITLE */}
              <textarea
                className="form-control form-control  fw-bold px-0 mb-3 shadow-none custom-title-input border-solid fs-5"
                placeholder="Enter story title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                rows={1}
                name="blog-title"
                id="blog-title"
              />
            </div>
            {/* SLUG PREVIEW */}
            {title && (
              <div className="d-flex align-items-center gap-2 mb-5 text-muted small p-2 rounded-3 bg-light bg-opacity-50 border border-light">
                <div className="d-flex align-items-center gap-2">
                  <Globe size={14} className="text-primary opacity-75" />
                  <span
                    className="fw-bold text-uppercase"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  >
                    Permalink:
                  </span>
                </div>
                <code className="bg-white px-2 py-1 rounded border text-dark x-small">
                  {window.location.origin}/blog/
                  <input
                    className="border-0 p-0 text-primary fw-bold outline-none"
                    value={
                      slug ||
                      title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")
                    }
                    onChange={(e) => setSlug(e.target.value)}
                    style={{
                      background: "transparent",
                      width: `${Math.max(50, (slug?.length || title.length) * 8)}px`,
                    }}
                  />
                </code>
              </div>
            )}

            {/* EDITOR */}
            <div className="rounded-4 shadow-sm overflow-hidden mb-5 border bg-white">
              <WysiwygField
                field={{
                  type: "wysiwyg",
                  label: "Content",
                  name: "content",
                  id: "blog-content",
                  key: "blog-content",
                }}
                value={content}
                onChange={setContent}
              />
            </div>

            {/* EXCERPT */}
            <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white border">
              <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                  <FileText size={18} className="text-primary" /> Story Excerpt
                </h6>
                <span className="text-muted x-small">
                  Short summary for list views
                </span>
              </div>
              <div className="card-body p-4">
                <textarea
                  className="form-control border-light shadow-none bg-light bg-opacity-25 rounded-3"
                  rows={4}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Provide a compelling summary of this story..."
                  style={{ fontSize: "0.95rem" }}
                />
              </div>
            </div>

            {/* FAQ SECTION */}
            <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white border">
              <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                  <MessageSquare size={18} className="text-primary" /> Frequently Asked Questions
                </h6>
                <button 
                  className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-sm"
                  onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                >
                  <Plus size={14} /> Add New FAQ
                </button>
              </div>
              <div className="card-body p-4">
                <div className="d-flex flex-column gap-4">
                  {faqItems.length > 0 ? faqItems.map((faq, index) => (
                    <div key={index} className="p-4 bg-light bg-opacity-25 rounded-4 border position-relative group-hover-border-primary transition-all">
                      <button 
                        className="btn btn-sm btn-light text-danger border shadow-sm rounded-circle p-2 position-absolute top-0 end-0 translate-middle-y translate-middle-x mt-4"
                        onClick={() => setFaqItems(faqItems.filter((_, i) => i !== index))}
                        title="Remove FAQ"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Question {index + 1}</label>
                          <input 
                            type="text" 
                            className="form-control border-light shadow-none bg-white rounded-3 fw-bold" 
                            placeholder="Enter the question here..." 
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...faqItems];
                              newFaqs[index].question = e.target.value;
                              setFaqItems(newFaqs);
                            }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="x-small fw-bold text-muted text-uppercase mb-2 d-block">Detailed Answer</label>
                          <textarea 
                            className="form-control border-light shadow-none bg-white rounded-3" 
                            rows={3} 
                            placeholder="Provide a helpful answer..." 
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...faqItems];
                              newFaqs[index].answer = e.target.value;
                              setFaqItems(newFaqs);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-5 bg-light bg-opacity-10 border-2 border-dashed rounded-4">
                      <MessageSquare size={48} className="text-muted opacity-20 mb-3 mx-auto" />
                      <h6 className="fw-bold text-dark opacity-50 mb-1">No FAQs defined for this story.</h6>
                      <p className="text-muted small mb-0">Help your readers by answering common questions about this topic.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO PANEL */}
            <div className="mb-5">
              <SeoPanel
                entityType="blog"
                entityId={postId || null}
                slug={
                  slug ||
                  title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")
                }
                title={title}
                content={content}
                featuredImage={featuredImage?.url}
                manualExcerpt={excerpt}
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside
          className="bg-white border-start h-100 d-flex flex-column shadow-sm"
          style={{ width: "380px", zIndex: 10 }}
        >
          {/* TABS */}
          <div className="d-flex border-bottom bg-light bg-opacity-50 p-1">
            {[
              { id: "settings", label: "Config", icon: <Settings size={14} /> }, 
              { id: "seo", label: "SEO", icon: <Globe size={14} /> },
              { id: "author", label: "Author", icon: <UserIcon size={14} /> },
              { id: "acf", label: "Meta", icon: <Plus size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-grow-1 py-2 px-1 small fw-bold border-0 rounded-3 transition-all d-flex align-items-center justify-content-center gap-2 ${activeSidebarTab === tab.id ? "bg-white text-primary shadow-sm" : "bg-transparent text-muted opacity-75 hover-opacity-1"}`}
                onClick={() => setActiveSidebarTab(tab.id as any)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
            {activeSidebarTab === "seo" && <SeoSidebar />}

            {activeSidebarTab === "settings" && (
              <div className="d-flex flex-column gap-5">
                <section>
                  <label
                    className="fw-bold text-uppercase text-muted mb-3 d-block"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  >
                    Publication Status
                  </label>
                  <div className="p-3 bg-light bg-opacity-50 rounded-4 border">
                    <select
                      className="form-select border-0 bg-transparent shadow-none fw-bold text-dark"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Public)</option>
                    </select>
                  </div>
                </section>

                <section>
                  <label
                    className="fw-bold text-uppercase text-muted mb-3 d-block"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  >
                    Visual Branding
                  </label>
                  {featuredImage ? (
                    <div className="position-relative group">
                      <div
                        className="rounded-4 overflow-hidden border shadow-sm transition-all hover-shadow-md"
                        onClick={() => setIsModalOpen(true)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={featuredImage.url}
                          alt="Featured"
                          className="w-100 h-auto d-block"
                          style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                        <div className="p-2 bg-white text-center border-top x-small fw-bold text-primary">
                          REPLACE IMAGE
                        </div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow-lg"
                        onClick={() => setFeaturedImage(null)}
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer hover-bg-light transition-all d-flex flex-column align-items-center"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle mb-3">
                        <ImageIcon size={32} strokeWidth={1.5} />
                      </div>
                      <p className="x-small fw-bold text-muted mb-0">
                        Select Featured Image
                      </p>
                      <span className="text-muted opacity-50 x-small mt-1">
                        Recommended: 1200x630px
                      </span>
                    </div>
                  )}
                </section>

                <section>
                  <label
                    className="fw-bold text-uppercase text-muted mb-3 d-block"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                  >
                    Taxonomy & Groups
                  </label>
                  <div
                    className="border rounded-4 p-3 bg-light bg-opacity-25 overflow-auto custom-scrollbar mb-4"
                    style={{ maxHeight: "200px" }}
                  >
                    <p className="fw-bold x-small text-muted text-uppercase mb-2">
                      Categories
                    </p>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="form-check custom-checkbox mb-2"
                        >
                          <input
                            className="form-check-input shadow-none"
                            type="checkbox"
                            id={`cat-${cat.id}`}
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                          />
                          <label
                            className="form-check-label small fw-medium text-dark"
                            htmlFor={`cat-${cat.id}`}
                          >
                            {cat.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted x-small mb-0 italic">
                        No categories available
                      </p>
                    )}
                  </div>

                  <div className="border rounded-4 p-3 bg-light bg-opacity-25">
                    <p className="fw-bold x-small text-muted text-uppercase mb-2">
                      Tags
                    </p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return (
                          <span
                            key={tagId}
                            className="badge bg-white border text-dark rounded-pill d-flex align-items-center gap-1 py-1 px-2 small fw-medium shadow-sm"
                          >
                            <Hash size={10} className="text-primary" />{" "}
                            {tag?.name}
                            <X
                              size={12}
                              className="cursor-pointer text-danger ms-1"
                              onClick={() => toggleTag(tagId)}
                            />
                          </span>
                        );
                      })}
                      {selectedTags.length === 0 && (
                        <p className="text-muted x-small mb-0 italic">
                          No tags selected
                        </p>
                      )}
                    </div>
                    <div className="position-relative">
                      <Hash
                        size={14}
                        className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm ps-4 border-light shadow-none bg-white rounded-3"
                        placeholder="Add tag and press Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="fw-bold text-uppercase text-muted mb-3 d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>Editorial Metrics</label>
                  <div className="p-3 bg-light bg-opacity-50 rounded-4 border d-flex flex-column gap-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Layout size={16} className="text-primary" />
                        <span className="small fw-bold text-dark">Table of Contents</span>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input shadow-none cursor-pointer" type="checkbox" checked={showToc} onChange={(e) => setShowToc(e.target.checked)} />
                      </div>
                    </div>
                    <div className="hr opacity-5 my-0"></div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="small fw-bold text-dark">Reading Time</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center fw-bold p-1 shadow-none border-light rounded-2" 
                          style={{ width: '45px' }} 
                          value={readingTime}
                          onChange={(e) => setReadingTime(parseInt(e.target.value) || 0)}
                        />
                        <span className="x-small text-muted fw-bold">MIN</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeSidebarTab === "author" && (
              <div className="d-flex flex-column gap-4">
                {!showNewAuthorForm ? (
                  <>
                    <section>
                      <label
                        className="fw-bold text-uppercase text-muted mb-3 d-block"
                        style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
                      >
                        Editorial Attribution
                      </label>
                      <div className="p-3 bg-white rounded-4 border shadow-sm mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="bg-dark text-white p-3 rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: "48px", height: "48px" }}
                          >
                            {(selectedAuthor?.name || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <h6 className="mb-0 fw-bold text-truncate text-dark">
                              {selectedAuthor?.name || "Unassigned"}
                            </h6>
                            <p className="mb-0 text-muted x-small text-truncate">
                              {selectedAuthor?.email || "Assign to an expert"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="wp-form-group">
                        <select
                          className="form-select border shadow-none rounded-3 py-2 small fw-medium"
                          value={authorId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "new") setShowNewAuthorFlow(true);
                            else setAuthorId(Number(val));
                          }}
                        >
                          <option value="">Choose Existing Author...</option>
                          {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                              {author.name}
                            </option>
                          ))}
                          <option value="new" className="text-primary fw-bold">
                            + Add New User
                          </option>
                        </select>
                      </div>

                      {authorId && !authorDetails && (
                        <div className="mt-4 p-4 border rounded-4 bg-warning bg-opacity-10 border-warning border-opacity-25">
                          <div className="d-flex align-items-center gap-2 small fw-bold text-dark mb-2">
                            <AlertTriangle size={16} className="text-warning" />{" "}
                            Action Required
                          </div>
                          <p className="x-small mb-3 text-secondary lh-sm">
                            This author profile is incomplete. Add a bio to
                            build trust with readers.
                          </p>
                          <button
                            className="btn btn-sm btn-dark w-100 rounded-pill fw-bold x-small py-2"
                            onClick={() => setIsAuthorModalOpen(true)}
                          >
                            Complete Profile
                          </button>
                        </div>
                      )}

                      {authorId && authorDetails && (
                        <div className="mt-4 p-3 border rounded-4 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="x-small fw-bold text-muted text-uppercase">
                              Public Biography
                            </span>
                            <button
                              className="btn btn-link p-0 text-primary"
                              onClick={() => setIsAuthorModalOpen(true)}
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                          <p className="x-small text-secondary mb-0 line-clamp-3">
                            {authorDetails.bio || "No public bio provided."}
                          </p>
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  <div className="animate-slide-up">
                    <h6 className="fw-bold x-small text-uppercase text-primary mb-3">
                      Onboard New Author
                    </h6>
                    <div className="d-flex flex-column gap-3 bg-light p-4 rounded-4 border">
                      <div>
                        <label className="form-label x-small fw-bold text-dark">
                          Full Legal Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm border shadow-none"
                          value={newAuthorData.name}
                          onChange={(e) =>
                            setNewAuthorData({
                              ...newAuthorData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="form-label x-small fw-bold text-dark">
                          Enterprise Email
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-sm border shadow-none"
                          value={newAuthorData.email}
                          onChange={(e) =>
                            setNewAuthorData({
                              ...newAuthorData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-primary flex-grow-1 rounded-pill fw-bold"
                          onClick={handleCreateNewAuthor}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Create"
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary flex-grow-1 rounded-pill fw-bold"
                          onClick={() => setShowNewAuthorFlow(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSidebarTab === "acf" && (
              <div className="text-center py-5 d-flex flex-column align-items-center">
                <div className="bg-light text-muted p-4 rounded-circle mb-3">
                  <Layout size={40} className="opacity-25" />
                </div>
                <h6 className="fw-bold text-dark mb-1">Extended Metadata</h6>
                <p className="text-muted small px-3">
                  Assignment of custom enterprise fields is handled in the main
                  workspace.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(m) => setFeaturedImage(Array.isArray(m) ? m[0] : m)}
        type="image"
        title="Featured Image"
      />

      <MediaLibraryModal
        isOpen={isHeroMediaModalOpen}
        onClose={() => setIsHeroMediaModalOpen(false)}
        onSelect={(m) => setHeroImage(Array.isArray(m) ? m[0] : m)}
        type="image"
        title="Post Hero Image"
      />

      {authorId && (
        <AuthorProfileModal
          isOpen={isAuthorModalOpen}
          onClose={() => setIsAuthorModalOpen(false)}
          authorId={authorId}
          authorName={selectedAuthor?.name || ""}
          authorEmail={selectedAuthor?.email || ""}
          onSave={(updatedMeta) => setAuthorDetails(updatedMeta)}
        />
      )}

      <style jsx>{`
        .blog-editor-root {
          height: 100vh;
          background-color: #f8fafc;
        }
        .x-small {
          font-size: 0.7rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .outline-none:focus {
          outline: none;
        }
        .custom-title-input::placeholder {
          color: #cbd5e1;
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .h-25px {
          height: 25px;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
