"use client";
import Swal from "sweetalert2";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  updateItem,
  removeItem,
  setSelectedItem,
  updateMenuSettings,
} from "@/store/slices/menuBuilderSlice";
import {
  Settings2,
  Link as LinkIcon,
  Trash2,
  X,
  Eye,
  Type,
} from "lucide-react";
import { MenuItemSettings } from "@/types/menu";

export default function InspectorSidebar() {
  const dispatch = useAppDispatch();
  const { selectedItemId, items, menuName, menuLocation, menuSettings } =
    useAppSelector((state) => state.menuBuilder);

  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId)
    : null;

  const handleItemSettingChange = (key: keyof MenuItemSettings, value: any) => {
    if (!selectedItem) return;
    const newSettings = { ...(selectedItem.settings_json || {}), [key]: value };
    dispatch(
      updateItem({ id: selectedItem.id, data: { settings_json: newSettings } }),
    );
  };

  const handleGlobalSettingChange = (key: string, value: any) => {
    dispatch(
      updateMenuSettings({ settings_json: { ...menuSettings, [key]: value } }),
    );
  };

  const handleUpdateItemLabel = (val: string) => {
    if (!selectedItem) return;
    dispatch(updateItem({ id: selectedItem.id, data: { label: val } }));
  };

  const handleUpdateItemUrl = (val: string) => {
    if (!selectedItem) return;
    dispatch(updateItem({ id: selectedItem.id, data: { url: val } }));
  };

  const handleRemoveItem = () => {
    if (
      selectedItem &&
      window.confirm("Delete this item and all its sub-items?")
    ) {
      dispatch(removeItem(selectedItem.id));
    }
  };

  if (!selectedItemId || !selectedItem) {
    // Render Global Menu Settings
    return (
      <div className="d-flex flex-column h-100 bg-white">
        <div className="p-4 border-bottom bg-light bg-opacity-50">
          <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Settings2 size={18} className="text-primary" />
            Menu Settings
          </h6>
          <p className="text-muted x-small mb-0">
            Global configuration for this menu
          </p>
        </div>

        <div className="flex-grow-1 overflow-auto p-4">
          <div className="mb-4">
            <label className="form-label x-small fw-bold text-uppercase text-muted">
              Menu Name
            </label>
            <input
              type="text"
              className="form-control"
              value={menuName}
              onChange={(e) =>
                dispatch(updateMenuSettings({ name: e.target.value }))
              }
            />
          </div>

          <div className="mb-4">
            <label className="form-label x-small fw-bold text-uppercase text-muted">
              Display Location
            </label>
            <select
              className="form-select"
              value={menuLocation || ""}
              onChange={(e) =>
                dispatch(
                  updateMenuSettings({ location: e.target.value || undefined }),
                )
              }
            >
              <option value="">-- Unassigned --</option>
              <option value="header_main">Main Header</option>
              <option value="header_top">Top Bar Header</option>
              <option value="footer_column_1">Footer Column 1</option>
              <option value="footer_column_2">Footer Column 2</option>
              <option value="footer_column_3">Footer Column 3</option>
              <option value="footer_bottom">Footer Bottom Bar</option>
              <option value="sidebar_main">Main Sidebar</option>
              <option value="mobile_nav">Mobile Navigation</option>
            </select>
          </div>

          <hr className="my-4 opacity-10" />

          <h6 className="fw-bold small mb-3">Advanced Features</h6>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="megaMenu"
              checked={!!menuSettings.mega_menu_enabled}
              onChange={(e) =>
                handleGlobalSettingChange("mega_menu_enabled", e.target.checked)
              }
            />
            <label
              className="form-check-label small fw-medium"
              htmlFor="megaMenu"
            >
              Enable Mega Menu support
            </label>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="mobileEnabled"
              checked={menuSettings.mobile_enabled !== false}
              onChange={(e) =>
                handleGlobalSettingChange("mobile_enabled", e.target.checked)
              }
            />
            <label
              className="form-check-label small fw-medium"
              htmlFor="mobileEnabled"
            >
              Show on mobile devices
            </label>
          </div>
        </div>

        <style jsx>{`
          .x-small {
            font-size: 0.7rem;
          }
        `}</style>
      </div>
    );
  }

  // Render Item-Specific Settings
  const itemSettings = selectedItem.settings_json || {};

  return (
    <div className="d-flex flex-column h-100 bg-white shadow-lg">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary x-small text-uppercase mb-1">
            {selectedItem.type.replace("_", " ")}
          </span>
          <h6
            className="fw-bold mb-0 text-truncate"
            style={{ maxWidth: "200px" }}
          >
            {selectedItem.label}
          </h6>
        </div>
        <button
          className="btn btn-sm btn-light border rounded-circle p-1 hover-bg-danger hover-text-white transition-all"
          onClick={() => dispatch(setSelectedItem(null))}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-4 scrollbar-thin">
        {/* Basic Info */}
        <div className="mb-4">
          <label className="form-label x-small fw-bold text-uppercase text-muted d-flex align-items-center gap-1">
            <Type size={14} /> Navigation Label
          </label>
          <input
            type="text"
            className="form-control"
            value={selectedItem.label}
            onChange={(e) => handleUpdateItemLabel(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label x-small fw-bold text-uppercase text-muted d-flex align-items-center gap-1">
            <LinkIcon size={14} /> URL / Path
          </label>
          <input
            type="text"
            className="form-control"
            value={selectedItem.url || ""}
            onChange={(e) => handleUpdateItemUrl(e.target.value)}
            disabled={selectedItem.type !== "custom_url" && selectedItem.type !== "announcement_header"}
          />
          {selectedItem.type !== "custom_url" && selectedItem.type !== "announcement_header" && (
            <div className="form-text x-small">
              URL is automatically synced with the {selectedItem.type}.
            </div>
          )}
        </div>

        <div className="form-check form-switch mb-4 pb-4 border-bottom">
          <input
            className="form-check-input"
            type="checkbox"
            id="openInNewTab"
            checked={!!itemSettings.open_in_new_tab}
            onChange={(e) =>
              handleItemSettingChange("open_in_new_tab", e.target.checked)
            }
          />
          <label
            className="form-check-label small fw-medium"
            htmlFor="openInNewTab"
          >
            Open in new tab
          </label>
        </div>

        {/* Visual Settings */}
        <h6 className="fw-bold small mb-3 text-dark">Visual Enhancements</h6>

        {selectedItem.type === "announcement_header" && (
          <div className="p-3 bg-light rounded-3 mb-4 d-flex flex-column gap-3 border border-light-subtle">
            <h6 className="fw-bold x-small text-uppercase text-primary mb-1">Announcement Settings</h6>
            
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label x-small fw-bold text-uppercase text-muted mb-1">Title</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Event Alert"
                  value={itemSettings.announcement_title || ""}
                  onChange={(e) =>
                    handleItemSettingChange("announcement_title", e.target.value)
                  }
                />
              </div>

              <div className="col-12">
                <label className="form-label x-small fw-bold text-uppercase text-muted mb-1">Announcement Text</label>
                <textarea
                  className="form-control form-control-sm"
                  placeholder="e.g. Join our tech conference this weekend!"
                  rows={2}
                  value={itemSettings.announcement_text || ""}
                  onChange={(e) =>
                    handleItemSettingChange("announcement_text", e.target.value)
                  }
                />
              </div>

              <div className="col-6">
                <label className="form-label x-small fw-bold text-uppercase text-muted mb-1">Btn Text</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Register"
                  value={itemSettings.announcement_button_text || ""}
                  onChange={(e) =>
                    handleItemSettingChange("announcement_button_text", e.target.value)
                  }
                />
              </div>

              <div className="col-6">
                <label className="form-label x-small fw-bold text-uppercase text-muted mb-1">Btn URL</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. /register"
                  value={itemSettings.announcement_button_url || ""}
                  onChange={(e) => {
                    handleItemSettingChange("announcement_button_url", e.target.value);
                    handleUpdateItemUrl(e.target.value); // Mirror to main URL
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {selectedItem.type === "cta_button" && (
          <div className="mb-3">
            <label className="form-label x-small fw-bold text-uppercase text-muted">
              Button Style
            </label>
            <select
              className="form-select form-select-sm"
              value={itemSettings.button_style || "primary"}
              onChange={(e) =>
                handleItemSettingChange("button_style", e.target.value)
              }
            >
              <option value="primary">Solid Primary</option>
              <option value="secondary">Solid Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost (Text Only)</option>
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label x-small fw-bold text-uppercase text-muted">
            Badge Text (Optional)
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="e.g. New, Sale, Hot"
            value={itemSettings.badge_text || ""}
            onChange={(e) =>
              handleItemSettingChange("badge_text", e.target.value)
            }
          />
        </div>

        <div className="mb-4 pb-4 border-bottom">
          <label className="form-label x-small fw-bold text-uppercase text-muted">
            CSS Classes (Optional)
          </label>
          <input
            type="text"
            className="form-control form-control-sm font-monospace"
            placeholder="custom-class-1"
            value={itemSettings.css_class || ""}
            onChange={(e) =>
              handleItemSettingChange("css_class", e.target.value)
            }
          />
        </div>

        {/* Advanced Settings */}
        <h6 className="fw-bold small mb-3 text-dark d-flex align-items-center gap-2">
          <Eye size={14} /> Visibility Rules
        </h6>

        <div className="mb-4">
          <select
            className="form-select form-select-sm"
            value={itemSettings.visibility || "all"}
            onChange={(e) =>
              handleItemSettingChange("visibility", e.target.value)
            }
          >
            <option value="all">Visible to Everyone</option>
            <option value="logged_in">Logged In Users Only</option>
            <option value="logged_out">Logged Out Users Only</option>
          </select>
        </div>
      </div>

      <div className="p-3 border-top bg-light">
        <button
          className="btn btn-outline-danger w-100 fw-bold rounded-pill d-flex justify-content-center align-items-center gap-2"
          onClick={handleRemoveItem}
        >
          <Trash2 size={16} /> Remove Item
        </button>
      </div>

      <style jsx>{`
        .x-small {
          font-size: 0.7rem;
        }
        .hover-bg-danger:hover {
          background-color: #ef4444 !important;
        }
        .hover-text-white:hover {
          color: white !important;
        }
        .transition-all {
          transition: all 0.2s;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
