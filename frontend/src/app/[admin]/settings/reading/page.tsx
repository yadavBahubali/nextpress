"use client";

import React, { useState, useEffect } from "react";
import { FaSave, FaBookOpen } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSettingsGroup, saveSettingsGroup } from "@/store/slices/settingsSlice";
import { fetchPages } from "@/store/slices/pageSlice";
import toast from "react-hot-toast";

export default function ReadingSettings() {
  const dispatch = useAppDispatch();
  const { settings, isLoading: settingsLoading, isSaving } = useAppSelector((state) => state.settings);
  const { pages, isLoading: pagesLoading } = useAppSelector((state) => state.pages);

  const [formData, setFormData] = useState({
    reading_front_page_type: "static",
    reading_homepage_id: "",
    reading_posts_per_page: "10",
    reading_discourage_search_engines: "0",
  });

  const keys = Object.keys(formData);

  useEffect(() => {
    dispatch(fetchSettingsGroup(keys)).unwrap().then((data) => {
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data
        }));
      }
    });
    dispatch(fetchPages());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveSettingsGroup({ data: formData, group: "reading" }))
      .unwrap()
      .then(() => toast.success("Reading settings saved successfully"))
      .catch((err) => toast.error(err || "Failed to save settings"));
  };

  if (settingsLoading && !Object.values(settings).length) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Reading Settings</h2>
          <p className="text-muted">Configure how your content is displayed to visitors.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <FaBookOpen className="text-success" /> Homepage & Listings
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Homepage Displays</label>
                <div className="mt-2">
                  <div className="form-check mb-2">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="reading_front_page_type" 
                      id="type_latest" 
                      value="latest"
                      checked={formData.reading_front_page_type === "latest"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="type_latest">Your latest posts</label>
                  </div>
                  <div className="form-check d-flex align-items-center gap-3">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="reading_front_page_type" 
                      id="type_static" 
                      value="static"
                      checked={formData.reading_front_page_type === "static"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="type_static">A static page:</label>
                    <select 
                      name="reading_homepage_id" 
                      className="form-select form-select-sm w-auto"
                      disabled={formData.reading_front_page_type !== "static"}
                      value={formData.reading_homepage_id}
                      onChange={handleChange}
                    >
                      <option value="">Select a page...</option>
                      {pages.map((page: any) => (
                        <option key={page.id} value={page.id}>{page.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Blog pages show at most</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    name="reading_posts_per_page"
                    className="form-control w-auto"
                    style={{ width: "80px" }}
                    value={formData.reading_posts_per_page}
                    onChange={handleChange}
                  />
                  <span>posts</span>
                </div>
                <div className="form-text">Number of posts to display per page on blog listing.</div>
              </div>

              <div className="mt-4 border-top pt-4">
                <label className="form-label fw-semibold">Search engine visibility</label>
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="reading_discourage_search_engines" 
                    id="discourage_search_engines"
                    checked={formData.reading_discourage_search_engines === "1"}
                    onChange={(e) => setFormData(prev => ({ ...prev, reading_discourage_search_engines: e.target.checked ? "1" : "0" }))}
                  />
                  <label className="form-check-label" htmlFor="discourage_search_engines">
                    Discourage search engines from indexing this site
                  </label>
                </div>
                <div className="form-text mt-1">
                  It is up to search engines to honor this request.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
