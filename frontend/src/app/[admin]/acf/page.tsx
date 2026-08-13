"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchFieldGroups } from "@/store/slices/acfSlice";
import AdminNavbar from "@/components/admin/acf/AdminNavbar";
import FieldGroupTable from "@/components/admin/acf/FieldGroupTable";

import "@/styles/wordpress-acf.css";

export default function ACFPage() {
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const { fieldGroups, isLoading, error } = useAppSelector((state) => state.acf);
  
  // Fetch on mount
  useEffect(() => {
    dispatch(fetchFieldGroups());
  }, [dispatch]);

  // If search is implemented in state locally or we need a new thunk for it
  const filteredGroups = fieldGroups.filter((group: any) => 
    group.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wp-admin-body">
      <AdminNavbar />

      <div className="container-fluid">
        {isLoading ? (
          <div className="wp-card p-5 text-center mt-4">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading field groups...
          </div>
        ) : error ? (
          <div className="wp-card p-5 text-center text-danger mt-4">
            {error}. Please try again.
          </div>
        ) : (
          <FieldGroupTable data={filteredGroups} />
        )}
      </div>
    </div>
  );
}
