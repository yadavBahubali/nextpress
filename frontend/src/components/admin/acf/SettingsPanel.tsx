"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useACFStore } from "@/store/acfStore";
import { fetchPages } from "@/store/slices/pageSlice";
import { cptService, PostType } from "@/services/cpt.service";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("location");
  const dispatch = useAppDispatch();

  const { fieldGroup, updateFieldGroup, updateGroupSettings, setGroupDescription } = useACFStore();
  const { pages, isLoading: isLoadingPages } = useAppSelector((state) => state.pages);

  const { settings, description, order_index } = fieldGroup;
  const locationRules = (settings as any).location_rules || [];

  // Fetch pages on mount if not already loaded
  useEffect(() => {
    if (pages.length === 0) {
      dispatch(fetchPages());
    }
  }, [dispatch, pages.length]);

  // Registered Custom Post Types (e.g. Industries), for the "Post Type"
  // location rule value dropdown. Uses the public endpoint (no admin-only
  // auth required) so Editors building field groups can load this list too.
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [isLoadingPostTypes, setIsLoadingPostTypes] = useState(true);

  useEffect(() => {
    cptService
      .getActiveTypes()
      .then((res) => setPostTypes(res.data || []))
      .catch(() => setPostTypes([]))
      .finally(() => setIsLoadingPostTypes(false));
  }, []);

  const addLocationRule = () => {
    const newRule = {
      param: "page",
      operator: "==",
      value: pages[0]?.id || "",
    };
    updateGroupSettings("location_rules", [...locationRules, newRule]);
  };

  const removeLocationRule = (index: number) => {
    const updated = [...locationRules];
    updated.splice(index, 1);
    updateGroupSettings("location_rules", updated);
  };

  const updateLocationRule = (index: number, key: string, value: any) => {
    const updated = [...locationRules];
    updated[index] = { ...updated[index], [key]: value };
    // Switching the rule type (Page <-> Post Type) invalidates whatever
    // value was picked under the old type (e.g. a page id doesn't mean
    // anything as a post type slug) - clear it so a stale value can't be
    // saved silently.
    if (key === "param") {
      updated[index].value = "";
    }
    updateGroupSettings("location_rules", updated);
  };

  const handleUpdateGroupDescription = (val: string) => {
    setGroupDescription(val);
  };

  const handleUpdateFieldGroup = (key: any, value: any) => {
    updateFieldGroup(key, value);
  };

  const handleUpdateGroupSettings = (key: string, value: any) => {
    updateGroupSettings(key, value);
  };

  return (
    <div className="wp-settings-panel card border-0 shadow-sm rounded-4 overflow-hidden mt-4">
      {/* TABS */}
      <div className="wp-field-tabs border-bottom bg-white d-flex px-3">
        <div
          className={`wp-field-tab py-3 px-4 fw-semibold cursor-pointer ${activeTab === "location" ? "active border-bottom border-primary border-3 text-primary" : "text-muted opacity-75"}`}
          onClick={() => setActiveTab("location")}
          style={{ cursor: 'pointer' }}
        >
          Location Rules
        </div>

        <div
          className={`wp-field-tab py-3 px-4 fw-semibold cursor-pointer ${activeTab === "group" ? "active border-bottom border-primary border-3 text-primary" : "text-muted opacity-75"}`}
          onClick={() => setActiveTab("group")}
          style={{ cursor: 'pointer' }}
        >
          Group Settings
        </div>
      </div>

      <div className="p-4 bg-white">
        {/* LOCATION RULES */}
        {activeTab === "location" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h6 className="fw-bold mb-1">Location Rules</h6>
                <p className="text-muted small mb-0">Define which pages or post types should show these custom fields.</p>
              </div>
              <button 
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-pill px-3"
                onClick={addLocationRule}
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>

            {locationRules.length === 0 ? (
              <div className="text-center py-5 bg-light bg-opacity-50 rounded-4 border border-dashed">
                <p className="text-muted mb-0 small">No rules defined. This group will not appear anywhere yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {locationRules.map((rule: any, index: number) => (
                  <div key={index} className="d-flex align-items-center gap-2 p-3 bg-light rounded-3 border">
                    <div className="flex-grow-1">
                      <select 
                        className="form-select form-select-sm border-0 bg-white"
                        value={rule.param}
                        onChange={(e) => updateLocationRule(index, "param", e.target.value)}
                      >
                        <option value="page">Page</option>
                        <option value="post_type">Post Type</option>
                      </select>
                    </div>

                    <div style={{ width: "120px" }}>
                      <select
                        className="form-select form-select-sm border-0 bg-white"
                        value={rule.operator}
                        onChange={(e) => updateLocationRule(index, "operator", e.target.value)}
                      >
                        <option value="==">is equal to</option>
                        <option value="!=">is not equal to</option>
                      </select>
                    </div>

                    <div className="flex-grow-1">
                      {rule.param === "post_type" ? (
                        isLoadingPostTypes ? (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : (
                          <select
                            className="form-select form-select-sm border-0 bg-white"
                            value={rule.value}
                            onChange={(e) => updateLocationRule(index, "value", e.target.value)}
                          >
                            <option value="">Select a post type...</option>
                            {postTypes.map((pt) => (
                              <option key={pt.id} value={pt.slug}>{pt.label}</option>
                            ))}
                            {/* The built-in Blog post type isn't in the CPT registry (it predates it),
                                but posts.repository.js already matches location rules against post_type == 'post'. */}
                            <option value="post">Blog Posts</option>
                          </select>
                        )
                      ) : isLoadingPages ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      ) : (
                        <select
                          className="form-select form-select-sm border-0 bg-white"
                          value={rule.value}
                          onChange={(e) => updateLocationRule(index, "value", e.target.value)}
                        >
                          <option value="">Select a page...</option>
                          {pages.map((page: any) => (
                            <option key={page.id} value={page.id}>{page.title}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button 
                      className="btn btn-link text-danger p-1"
                      onClick={() => removeLocationRule(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GROUP SETTINGS */}
        {activeTab === "group" && (
          <div className="row g-4">
            <div className="col-md-8">
              {/* DESCRIPTION */}
              <div className="wp-form-group mb-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Description</label>
                <textarea
                  className="form-control bg-light border-0"
                  rows={5}
                  value={description || ""}
                  onChange={(e) => handleUpdateGroupDescription(e.target.value)}
                  placeholder="Optional internal description for this group..."
                />
              </div>
            </div>

            <div className="col-md-4">
              {/* ORDER INDEX */}
              <div className="wp-form-group mb-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Order Index</label>
                <input
                  type="number"
                  className="form-control bg-light border-0"
                  value={order_index || 0}
                  onChange={(e) => handleUpdateFieldGroup("order_index", parseInt(e.target.value))}
                />
                <div className="form-text small">Determines section position on page.</div>
              </div>

              {/* ACTIVE */}
              <div className="wp-form-group p-4 bg-light rounded-4 text-center">
                <label className="form-label d-block fw-bold small text-uppercase text-muted mb-3">Group Status</label>
                <div className="form-check form-switch d-flex justify-content-center">
                  <input
                    className="form-check-input ms-0"
                    type="checkbox"
                    role="switch"
                    id="group-active-switch"
                    checked={(settings as any).active}
                    onChange={(e) =>
                      handleUpdateGroupSettings("active", e.target.checked)
                    }
                    style={{ width: '3em', height: '1.5em' }}
                  />
                </div>
                <div className="mt-2 small text-muted">
                  {(settings as any).active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .wp-field-tab.active {
          opacity: 1 !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
}
