"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { FaArrowLeft, FaSave, FaTimes, FaPlus, FaLayerGroup } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/store";
import { resetSeo } from "@/store/slices/seoSlice";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";
import { Media } from "@/services/media.service";
import { cptService, PostType } from "@/services/cpt.service";
import { acfService, ACFGroup } from "@/services/acf.service";
import FieldRenderer from "@/components/admin/page-editor/FieldRenderer";
import SeoPanel from "@/components/admin/seo/SeoPanel";
import { Field } from "@/types/acf";

interface Props {
  mode: "create" | "edit";
  postType: string;
  entryId?: string;
  adminPath: string;
}

interface FormState {
  title: string;
  slug: string;
  status: "draft" | "published";
  featured_image_id: number | null;
  featured_image_url: string | null;
}

// ACF field values are stored nested by the owning field group's key, e.g.
// { industry_details: { short_description: "..." } } - the same convention
// already used for Pages' content_json, so this shape round-trips cleanly
// through cptService.getEntry()/createEntry()/updateEntry().
type ContentState = Record<string, Record<string, unknown>>;

export default function CptEntryEditor({ mode, postType, entryId, adminPath }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [typeInfo, setTypeInfo] = useState<PostType | null>(null);
  const [fieldGroups, setFieldGroups] = useState<ACFGroup[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    status: "draft",
    featured_image_id: null,
    featured_image_url: null,
  });
  const [content, setContent] = useState<ContentState>({});
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [typesRes, groupsRes] = await Promise.all([
          cptService.getActiveTypes(),
          acfService.getGroupsForPostType(postType),
        ]);

        setTypeInfo(typesRes.data.find((t) => t.slug === postType) || null);
        setFieldGroups(groupsRes.filter((g) => g.status === "active"));

        if (mode === "edit" && entryId) {
          const entryRes = await cptService.getEntry(entryId);
          const entry = entryRes.data;
          setForm({
            title: entry.title,
            slug: entry.slug,
            status: entry.status,
            featured_image_id: entry.featured_image_id ?? null,
            featured_image_url: entry.featured_image_url ?? null,
          });
          setContent(entry.acf && typeof entry.acf === "object" ? entry.acf : {});
        }
      } catch (err) {
        const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
        setError(message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => {
      dispatch(resetSeo());
    };
  }, [mode, postType, entryId, dispatch]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched
        ? prev.slug
        : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  };

  const handleFieldChange = (groupKey: string, fieldName: string, value: unknown) => {
    setContent((prev) => ({
      ...prev,
      [groupKey]: { ...(prev[groupKey] || {}), [fieldName]: value },
    }));
  };

  const handleSelectMedia = (media: Media | Media[]) => {
    const item = Array.isArray(media) ? media[0] : media;
    setForm((prev) => ({ ...prev, featured_image_id: item.id, featured_image_url: item.url }));
    setIsMediaModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = { ...form, content_json: content };

      if (mode === "create") {
        await cptService.createEntry(postType, payload);
        toast.success(`${typeInfo?.singular_label || "Entry"} created successfully`);
      } else if (entryId) {
        await cptService.updateEntry(entryId, payload);
        toast.success(`${typeInfo?.singular_label || "Entry"} updated successfully`);
      }

      router.push(`/${adminPath}/cpt/${postType}`);
    } catch (err) {
      const msg = (err instanceof AxiosError ? err.response?.data?.message : undefined) || "Failed to save entry";
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary me-2" />
        <span className="text-muted">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href={`/${adminPath}/cpt/${postType}`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
            <FaArrowLeft />
          </Link>
          <h2 className="fw-bold mb-0">
            {mode === "create" ? `Add New ${typeInfo?.singular_label || ""}` : `Edit ${typeInfo?.singular_label || "Entry"}`}
          </h2>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4 shadow-sm border-0">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 border-bottom-0">
              <h5 className="mb-0 fw-bold">{typeInfo?.singular_label || "Entry"} Details</h5>
            </div>
            <div className="card-body p-4">
              <form id="cpt-entry-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder={`e.g. IT Services`}
                    value={form.title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold small text-uppercase text-muted">URL Slug</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 text-muted">/{postType}/</span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ACF FIELD GROUPS - reuses the same FieldRenderer as the Page editor */}
          {fieldGroups.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
              <div className="bg-primary-subtle text-primary p-4 rounded-circle d-inline-flex mb-4">
                <FaLayerGroup size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-2">No Fields Assigned Yet</h5>
              <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: "400px" }}>
                This post type doesn&apos;t have any ACF field groups yet. Create one in the ACF module with a
                Location Rule of <code>Post Type == {postType}</code>.
              </p>
              <Link href={`/${adminPath}/acf`} className="btn btn-primary rounded-pill px-4">
                Manage ACF Groups
              </Link>
            </div>
          ) : (
            fieldGroups.map((group) => (
              <div key={group.id} className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-bottom">
                  <h6 className="mb-0 fw-bold">{group.title}</h6>
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    {(group.fields || []).map((field: Field, idx: number) => (
                      <div key={field.id || `${field.name}-${idx}`} className="col-12" style={{ width: field.wrapper?.width || "100%" }}>
                        <FieldRenderer
                          field={field}
                          value={content[group.group_key!]?.[field.name]}
                          onChange={(val) => handleFieldChange(group.group_key!, field.name, val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* SEO MANAGER - same generic entityType/entityId-driven panel Pages
              uses (backend already treats any post type slug as a valid
              seo_meta.entity_type, so this needed no new API). Only shown in
              edit mode: like the Page editor, SEO needs a real entry id to
              key against, so a brand-new entry must be saved once first. */}
          {mode === "edit" && entryId && (
            <SeoPanel
              entityType={postType}
              entityId={entryId}
              slug={form.slug}
              title={form.title}
              content={JSON.stringify(content)}
              featuredImage={form.featured_image_url || undefined}
            />
          )}
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
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    form="cpt-entry-form"
                    className="btn btn-primary py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? <span className="spinner-border spinner-border-sm" role="status" /> : <FaSave />}
                    {mode === "create" ? "Create" : "Save Changes"}
                  </button>
                  <Link href={`/${adminPath}/cpt/${postType}`} className="btn btn-light py-2 text-muted">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Featured Image</h5>
              </div>
              <div className="card-body p-4">
                {form.featured_image_id ? (
                  <div className="position-relative">
                    <div
                      className="rounded-4 overflow-hidden border shadow-sm"
                      onClick={() => setIsMediaModalOpen(true)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={form.featured_image_url || ""} alt="Featured" className="w-100 h-auto d-block" />
                      <div className="p-2 bg-white text-center border-top small fw-medium text-primary">Change Image</div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm p-1 rounded-circle position-absolute top-0 start-100 translate-middle shadow"
                      onClick={() => setForm((prev) => ({ ...prev, featured_image_id: null, featured_image_url: null }))}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border border-2 border-dashed rounded-4 p-5 text-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsMediaModalOpen(true)}
                  >
                    <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex mb-3">
                      <FaPlus size={24} />
                    </div>
                    <p className="small fw-bold mb-1">Select Featured Image</p>
                  </div>
                )}
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
