"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useACFStore } from "@/store/acfStore";
import { acfService } from "@/services/acf.service";
import { Plus, ChevronDown, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import AdminNavbar from "@/components/admin/acf/AdminNavbar";
import FieldCard from "@/components/admin/acf/FieldCard";
import SettingsPanel from "@/components/admin/acf/SettingsPanel";
import toast from "react-hot-toast";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import "@/styles/wordpress-acf.css";

export default function EditFieldGroupPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const adminPath = (params?.admin as string) || "admin";

  const { 
    fieldGroup, 
    setFieldGroup, 
    addField, 
    reorderFields, 
    setGroupTitle, 
    resetStore 
  } = useACFStore();
  
  const { title, fields, groupKey, settings } = fieldGroup;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      reorderFields(oldIndex, newIndex);
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch group data on mount
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setIsLoading(true);
        const data = await acfService.getGroup(id);
        
        const fetchedSettings = typeof (data as any).settings === 'string' 
          ? JSON.parse((data as any).settings) 
          : ((data as any).settings || {});

        // Ensure active status is synced between column and settings object
        fetchedSettings.active = data.status === 'active';

        // Map backend data to frontend store structure
        setFieldGroup({
          id: data.id.toString(),
          title: data.title,
          description: data.description,
          groupKey: data.group_key,
          fields: data.fields || [],
          page_id: data.page_id,
          order_index: data.order_index || 0,
          settings: {
            location_rules: [],
            presentation: {
              style: "default",
              position: "normal",
              label_placement: "top",
              instruction_placement: "label",
            },
            ...fetchedSettings
          }
        });

        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch ACF group:", err);
        setError("Failed to load the field group. It might have been deleted or moved.");
        toast.error("Error loading field group");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGroup();
    }

    return () => {
      resetStore();
    };
  }, [id, setFieldGroup, resetStore]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for the field group");
      return;
    }

    const validationError = validateFields(fields);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsSaving(true);

      // Auto-detect page_id from location rules
      const locationRules = (settings as any).location_rules || [];
      const primaryPageRule = locationRules.find((r: any) => r.param === "page" && r.operator === "==");
      const autoPageId = primaryPageRule ? parseInt(primaryPageRule.value) : null;

      const payload = {
        title: title,
        description: emptyToNull(fieldGroup.description),
        group_key: groupKey,
        fields: fields.map(sanitizeField),
        settings: settings,
        active: (settings as any).active ? 1 : 0,
        page_id: autoPageId || fieldGroup.page_id,
        order_index: fieldGroup.order_index
      };

      await acfService.updateGroup(id, payload);
      toast.success("Changes saved successfully!");
    } catch (err: any) {
      console.error("Failed to save ACF group:", err);
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="wp-admin-body min-vh-100 d-flex flex-column">
        <AdminNavbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <Loader2 className="animate-spin mb-3 text-primary mx-auto" size={40} />
            <p className="text-muted">Loading field group settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wp-admin-body min-vh-100 d-flex flex-column">
        <AdminNavbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
          <div className="wp-card p-5 text-center max-w-md">
            <div className="text-danger mb-4">
              <Plus size={48} style={{ transform: 'rotate(45deg)' }} className="mx-auto" />
            </div>
            <h3 className="h5 fw-bold mb-3">{error}</h3>
            <Link href={`/${adminPath}/acf`} className="btn btn-primary rounded-pill px-4">
              <ArrowLeft size={16} className="me-2" />
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-admin-body">
      <AdminNavbar />

      <div className="container-fluid py-4 px-lg-5">
        {/* PAGE HEADER */}
        <div className="wp-page-header d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div className="d-flex align-items-center flex-grow-1 gap-2">
            <h1 className="wp-title mb-0">Edit Field Group</h1>
            <input 
              type="text" 
              className="wp-title-input flex-grow-1" 
              placeholder="Enter title here..."
              value={title}
              onChange={(e) => setGroupTitle(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <button 
              className="wp-button wp-button-outline" 
              onClick={() => addField()}
              disabled={isSaving}
            >
              <Plus size={14} className="me-1" />
              Add Field
            </button>
            <button 
              className="wp-button btn-primary" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="me-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT ROW */}
        <div className="row">
          <div className="col-lg-12">
            <div className="wp-card mb-4">
              <div className="wp-card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-bold">Fields</span>
                <ChevronDown size={16} className="text-muted" />
              </div>
              
              <div className="p-3 bg-light border-bottom d-none d-md-block">
                <div className="d-flex align-items-center text-muted small fw-bold px-3 py-1">
                  <div style={{ width: "30px" }}>#</div>
                  <div style={{ width: "20px" }}></div>
                  <div className="flex-grow-1 ms-4">Label</div>
                  <div style={{ width: "200px" }}>Name</div>
                  <div style={{ width: "200px" }}>Key</div>
                  <div style={{ width: "150px" }}>Type</div>
                </div>
              </div>

              <div className="p-3">
                {fields.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light rounded-3 mb-3 border border-dashed">
                    <p className="mb-0">No fields yet. Click "Add Field" to begin.</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="d-flex flex-column gap-2">
                        {fields.map((field, index) => (
                          <FieldCard key={field.id} field={field} index={index} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
                
                <div className="mt-3">
                  <button 
                    className="wp-button py-2 px-3 w-100 justify-content-center bg-light text-dark border-secondary-subtle" 
                    onClick={() => addField()}
                    disabled={isSaving}
                  >
                    <Plus size={14} className="me-2" />
                    Add Field
                  </button>
                </div>
              </div>
            </div>

            {/* SETTINGS PANEL */}
            <SettingsPanel />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .wp-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .wp-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
}
