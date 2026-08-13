"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
interface Props {
  search: string;
  setSearch: (value: string) => void;
  total: number;
}

export default function TableToolbar({ search, setSearch, total }: Props) {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";

  return (
    <div className="wp-toolbar">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <h1 className="wp-title mb-0">
            Field Groups
            <span className="text-muted ms-2">({total})</span>
          </h1>
          <Link
            href={`/${adminPath}/acf/create`}
            className="wp-button-outline text-decoration-none d-flex align-items-center justify-content-center"
            style={{ height: "30px", padding: "0 10px", fontSize: "13px" }}
          >
            Add New
          </Link>
        </div>
      </div>

      <div className="wp-search-box d-flex align-items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="wp-form-control py-1 px-2"
          style={{
            width: "240px",
            fontSize: "13px",
            height: "30px",
          }}
          placeholder="Search Field Groups"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="wp-button-outline py-1 px-2"
            style={{
              fontSize: "13px",
              height: "30px",
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
