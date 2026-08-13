"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { FaPlus, FaEdit, FaTrash, FaListUl, FaLayerGroup } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";
import { cptService, PostType } from "@/services/cpt.service";

export default function PostTypesManagement() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";

  const [types, setTypes] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped after create/delete to trigger a refetch (see the comment in
  // cpt/[type]/page.tsx for why this is a dependency rather than an
  // imperative load() call shared between the effect and event handlers).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await cptService.getAllTypes();
        if (cancelled) return;
        setTypes(res.data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
        setError(message || "Failed to load post types. Please check if the backend is running and you are logged in.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleDelete = async (id: number, label: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Deleting "${label}" will also permanently delete every entry inside it. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete everything",
    });
    if (result.isConfirmed) {
      try {
        await cptService.deleteType(id);
        toast.success("Post type deleted successfully");
        setRefreshKey((k) => k + 1);
      } catch (err) {
        const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
        toast.error(message || "Failed to delete post type");
      }
    }
  };

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "label", label: "Label", sortable: true, render: (val: any) => <span className="fw-semibold text-dark">{val}</span> },
    { key: "slug", label: "Slug", sortable: true, render: (val: any) => <span className="text-muted">/{val}</span> },
    {
      key: "is_public",
      label: "Public",
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === 1 ? "success" : "secondary"} bg-opacity-10 text-${val === 1 ? "success" : "secondary"}`}>
          {val === 1 ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === 1 ? "success" : "warning"} bg-opacity-10 text-${val === 1 ? "success" : "warning"}`}>
          {val === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, row: PostType) => (
        <div className="d-flex justify-content-end gap-2">
          <Link
            href={`/${adminPath}/cpt/${row.slug}`}
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center"
            title="View Entries"
            style={{ width: "40px", height: "40px" }}
          >
            <FaListUl size={14} className="text-muted" />
          </Link>
          <Link
            href={`/${adminPath}/cpt-types/edit/${row.id}`}
            className="btn btn-light border text-primary rounded-4 d-flex align-items-center justify-content-center"
            title="Edit"
            style={{ width: "40px", height: "40px" }}
          >
            <FaEdit size={14} />
          </Link>
          <button
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center"
            title="Delete"
            style={{ width: "40px", height: "40px" }}
            onClick={() => handleDelete(row.id, row.label)}
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Post Types</h2>
          <p className="text-muted">
            Define custom content types (like Industries, Events, News). Each one gets its own sidebar section, list, and entry editor - attach an ACF field group to it (Location Rule: Post Type) to define what fields each entry has.
          </p>
        </div>
        <Link href={`/${adminPath}/cpt-types/create`} className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> New Post Type
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading post types...
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-5">
            <FaLayerGroup size={40} className="text-muted opacity-25 mb-3" />
            <p className="text-muted mb-0">No post types yet. Create your first one to get started.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={types}
            searchPlaceholder="Search by label or slug..."
            searchKeys={["label", "slug"]}
            defaultSortKey="id"
            defaultSortDirection="asc"
            defaultRowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
