"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import { cptService, PostType } from "@/services/cpt.service";
import { POST_TYPE_ICON_OPTIONS, resolvePostTypeIcon } from "@/utils/postTypeIcons";

interface Props {
  mode: "create" | "edit";
  typeId?: string;
  adminPath: string;
}

interface FormState {
  slug: string;
  label: string;
  singular_label: string;
  icon: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
}

const emptyForm: FormState = {
  slug: "",
  label: "",
  singular_label: "",
  icon: "FaLayerGroup",
  description: "",
  is_public: true,
  is_active: true,
};

export default function PostTypeForm({ mode, typeId, adminPath }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && typeId) {
      cptService
        .getAllTypes()
        .then((res) => {
          const type = res.data.find((t) => t.id === Number(typeId));
          if (type) {
            setForm({
              slug: type.slug,
              label: type.label,
              singular_label: type.singular_label,
              icon: type.icon || "FaLayerGroup",
              description: type.description || "",
              is_public: type.is_public === 1,
              is_active: type.is_active === 1,
            });
          } else {
            setError("Post type not found");
          }
        })
        .catch((err) => setError((err instanceof AxiosError ? err.response?.data?.message : undefined) || "Failed to load post type"))
        .finally(() => setIsLoading(false));
    }
  }, [mode, typeId]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setForm((prev) => ({
      ...prev,
      label,
      slug: slugTouched ? prev.slug : label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.label || !form.singular_label) {
      toast.error("Label, singular label, and slug are required");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload: Partial<PostType> = {
        slug: form.slug,
        label: form.label,
        singular_label: form.singular_label,
        icon: form.icon,
        description: form.description,
        is_public: form.is_public ? 1 : 0,
        is_active: form.is_active ? 1 : 0,
      };

      if (mode === "create") {
        await cptService.createType(payload);
        toast.success(`"${form.label}" created. It now appears in the sidebar.`);
      } else if (typeId) {
        await cptService.updateType(typeId, payload);
        toast.success(`"${form.label}" updated successfully`);
      }

      router.push(`/${adminPath}/cpt-types`);
    } catch (err) {
      const msg = (err instanceof AxiosError ? err.response?.data?.message : undefined) || "Failed to save post type";
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
        <span className="text-muted">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link href={`/${adminPath}/cpt-types`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <FaArrowLeft />
        </Link>
        <h2 className="fw-bold mb-0">{mode === "create" ? "New Post Type" : `Edit "${form.label}"`}</h2>
      </div>

      {error && <div className="alert alert-danger mb-4 shadow-sm border-0">{error}</div>}

      <div className="row g-4 justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-lg-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">
                    Plural Label <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0"
                    placeholder="e.g. Industries"
                    value={form.label}
                    onChange={handleLabelChange}
                    required
                  />
                  <div className="form-text">Shown in the sidebar and list pages (e.g. &quot;All Industries&quot;).</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">
                    Singular Label <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="e.g. Industry"
                    value={form.singular_label}
                    onChange={(e) => setForm((prev) => ({ ...prev, singular_label: e.target.value }))}
                    required
                  />
                  <div className="form-text">Used on buttons (e.g. &quot;Add New Industry&quot;).</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">
                    Slug <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0 text-muted">/</span>
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      value={form.slug}
                      disabled={mode === "edit"}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
                      }}
                      required
                    />
                  </div>
                  <div className="form-text">
                    {mode === "edit"
                      ? "The slug can't be changed after creation (it's used in URLs and ACF location rules)."
                      : "Used in admin/public URLs (e.g. /industries) and as the ACF location-rule value."}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Sidebar Icon</label>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-3 flex-shrink-0"
                      style={{ width: "46px", height: "46px", fontSize: "1.25rem" }}
                    >
                      {resolvePostTypeIcon(form.icon)}
                    </div>
                    <select
                      className="form-select bg-light border-0"
                      value={form.icon}
                      onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                    >
                      {POST_TYPE_ICON_OPTIONS.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-text">Pick how this post type appears in the sidebar.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Description</label>
                  <textarea
                    className="form-control bg-light border-0"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="d-flex gap-4 mb-4">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={form.is_public}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_public: e.target.checked }))}
                      id="is_public"
                    />
                    <label className="form-check-label small" htmlFor="is_public">
                      Public (has listing/detail pages)
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={form.is_active}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                      id="is_active"
                    />
                    <label className="form-check-label small" htmlFor="is_active">
                      Active (shows in sidebar)
                    </label>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2" disabled={isSaving}>
                    {isSaving ? <span className="spinner-border spinner-border-sm" role="status" /> : <FaSave />}
                    {mode === "create" ? "Create Post Type" : "Save Changes"}
                  </button>
                  <Link href={`/${adminPath}/cpt-types`} className="btn btn-light px-4 text-muted">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
