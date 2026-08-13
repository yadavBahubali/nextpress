"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { acfService } from "@/services/acf.service";
import { useACFStore } from "@/store/acfStore";
import toast from "react-hot-toast";

import AdminNavbar from "@/components/admin/acf/AdminNavbar";
import AccordionSection from "@/components/admin/acf/AccordionSection";
import FieldCard from "@/components/admin/acf/FieldCard";
import SettingsPanel from "@/components/admin/acf/SettingsPanel";

import "@/styles/wordpress-acf.css";

export default function CreateFieldGroupPage() {
  const router = useRouter();
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";

  const {
    fieldGroup,
    addField,
    resetStore,
    setGroupTitle,
    setFieldGroup,
  } = useACFStore();

  const { fields, title, groupKey, settings } = fieldGroup;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resetStore();
    // Initialize with a default key just in case
    setFieldGroup({ groupKey: '' });
  }, [resetStore, setFieldGroup]);

  /**
   * Transforms empty strings to null for the database.
   */
  const emptyToNull = (val: any) => {
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
  };

  /**
   * Transforms the UI-state field into a Backend-friendly JSON.
   */
  const sanitizeField = (field: any): any => {
    const sanitized: any = {
      key: field.key,
      label: emptyToNull(field.label),
      name: emptyToNull(field.name),
      type: field.type,
      instructions: emptyToNull(field.instructions),
      required: field.required ? 1 : 0,
      default_value: emptyToNull(field.defaultValue),
      placeholder: emptyToNull(field.placeholder),
      settings: {
        ...(field.settings || {}),
      },
      wrapper: {
        width: emptyToNull(field.wrapper?.width) || "100%",
        class: emptyToNull(field.wrapper?.class),
        id: emptyToNull(field.wrapper?.id),
      },
    };

    // Clean up field-specific settings
    if (sanitized.settings.choices) {
      sanitized.settings.choices = sanitized.settings.choices.map((c: any) => ({
        label: emptyToNull(c.label),
        value: emptyToNull(c.value),
      })).filter((c: any) => c.label !== null || c.value !== null);
      if (sanitized.settings.choices.length === 0) sanitized.settings.choices = null;
    }

    // Recursively handle sub-fields for Repeaters/Accordions/etc.
    if (field.subFields && Array.isArray(field.subFields) && field.subFields.length > 0) {
      sanitized.sub_fields = field.subFields.map(sanitizeField);
    } else if (["repeater", "accordion", "tab"].includes(field.type)) {
      sanitized.sub_fields = null;
    }

    return sanitized;
  };

  const validateFields = (fields: any[]): string | null => {
    const names = new Set<string>();

    const check = (list: any[], path = ""): string | null => {
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        const fieldLabel = f.label || `Field ${i + 1}`;
        const fullPath = path ? `${path} > ${fieldLabel}` : fieldLabel;

        if (!f.label?.trim()) return `Field label is required for "${fullPath}"`;
        if (!f.name?.trim()) return `Field name is required for "${fullPath}"`;
        
        if (names.has(f.name)) return `Duplicate field name found: "${f.name}"`;
        names.add(f.name);

        // Type specific validation
        if (["select", "checkbox", "radio"].includes(f.type)) {
          const choices = f.settings?.choices || [];
          if (choices.length === 0) return `Choices are required for selection field "${fullPath}"`;
          for (const choice of choices) {
            if (!choice.label?.trim() || !choice.value?.trim()) {
              return `All choices must have both a label and a value in "${fullPath}"`;
            }
          }
        }

        if (f.type === "repeater") {
          if (!f.subFields || f.subFields.length === 0) {
            return `Repeater field "${fullPath}" must have at least one sub-field`;
          }
        }

        // Recursive check
        if (f.subFields && f.subFields.length > 0) {
          const error = check(f.subFields, fullPath);
          if (error) return error;
        }
      }
      return null;
    };

    return check(fields);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a field group title");
      return;
    }

    const validationError = validateFields(fields);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);

      // Auto-detect page_id from location rules
      const primaryPageRule = (settings as any).location_rules?.find((r: any) => r.param === "page" && r.operator === "==");
      const autoPageId = primaryPageRule ? parseInt(primaryPageRule.value) : null;

      const payload = {
        title,
        group_key: groupKey,
        description: emptyToNull(fieldGroup.description),
        active: (settings as any).active ? 1 : 0,
        page_id: autoPageId || fieldGroup.page_id,
        order_index: fieldGroup.order_index,
        settings: {
          ...settings,
          location_rules: (settings as any).location_rules || []
        },
        fields: fields.map(sanitizeField),
      };

      const response = await acfService.createGroup(payload);
      toast.success(response.message || "Field group created successfully");
      router.push(`/${adminPath}/acf`);
    } catch (error: any) {
      console.error("SAVE ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to create field group");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="acf-admin-root">
      <AdminNavbar />

      <div className="container-fluid py-4 px-4 px-lg-5">

        {/* ── PAGE HEADER ── */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <input
              type="text"
              className="form-control acf-title-input"
              placeholder="Enter field group title…"
              value={title}
              onChange={(e) => setGroupTitle(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-1"
              onClick={() => addField()}
            >
              <Plus size={15} />
              Add Field
            </button>

            <button
              className="btn btn-primary d-flex align-items-center gap-1 px-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">

            {/* ── FIELDS SECTION ── */}
            <AccordionSection title="Fields">
              <div>
                {/* Column headers */}
                <div className="acf-col-header d-flex align-items-center px-3 py-2 border-bottom bg-light small text-muted fw-semibold">
                  <div style={{ width: 32 }}>#</div>
                  <div style={{ width: 24 }} />
                  <div className="flex-grow-1 ms-3">Label</div>
                  <div style={{ width: 180 }}>Name</div>
                  <div style={{ width: 200 }}>Key</div>
                  <div style={{ width: 140 }}>Type</div>
                </div>

                {/* Field rows */}
                <div className="p-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-5 my-2">
                      <div className="acf-empty-icon mx-auto mb-3">
                        <Plus size={28} strokeWidth={1.5} className="text-muted" />
                      </div>
                      <p className="text-muted mb-3 small">
                        No fields yet. Click below to add your first field.
                      </p>
                      <button
                        className="btn btn-outline-primary px-4"
                        onClick={() => addField()}
                      >
                        <Plus size={14} className="me-1" />
                        Add Field
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex flex-column gap-2">
                        {fields.map((field, index) => (
                          <FieldCard key={field.id} field={field} index={index} />
                        ))}
                      </div>

                      <div className="mt-3 d-flex justify-content-end">
                        <button
                          className="btn btn-primary d-flex align-items-center gap-1"
                          onClick={() => addField()}
                        >
                          <Plus size={14} />
                          Add Field
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </AccordionSection>

            {/* ── SETTINGS SECTION ── */}
            <AccordionSection title="Settings">
              <SettingsPanel />
            </AccordionSection>

            {/* ── SLUG SECTION ── */}
            <AccordionSection title="Slug" initialOpen={false}>
              <div className="p-4">
                <div className="mb-0">
                  <label className="form-label fw-semibold small text-uppercase ls-wide text-muted">
                    Field Group Slug
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">
                      <small>key</small>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light font-monospace text-secondary"
                      readOnly
                      value={groupKey}
                    />
                  </div>
                  <div className="form-text mt-2">
                    The unique identifier for this field group. Auto-generated and read-only.
                  </div>
                </div>
              </div>
            </AccordionSection>

          </div>
        </div>
      </div>

      <style jsx global>{`
        .acf-admin-root {
          background-color: #f6f7f8;
          min-height: 100vh;
        }

        .ls-wide {
          letter-spacing: 0.06em;
        }

        .acf-title-input {
          font-size: 0.95rem;
          border-radius: 6px;
          border: 1.5px solid #d0d5dd;
          padding: 7px 12px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .acf-title-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
          outline: none;
        }
        .acf-title-input::placeholder {
          color: #adb5bd;
          font-style: italic;
        }

        .acf-col-header {
          border-radius: 0;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .acf-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f1f3f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ensure accordion cards feel polished */
        .card,
        .accordion-item {
          border-radius: 10px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}
