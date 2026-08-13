"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { FaPlus, FaEdit, FaTrash, FaEye, FaLayerGroup } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";
import { cptService, CptEntry, PostType } from "@/services/cpt.service";

export default function CptEntriesList() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const postType = params?.type as string;

  const [entries, setEntries] = useState<CptEntry[]>([]);
  const [typeInfo, setTypeInfo] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped after a delete to trigger the effect below to refetch, instead of
  // the effect and the delete handler both imperatively calling a shared
  // loader function (which the project's stricter effect-purity lint rule
  // flags as an effect indirectly causing cascading setState).
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!postType) return;
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [entriesRes, typesRes] = await Promise.all([
          cptService.getEntries(postType),
          cptService.getActiveTypes(),
        ]);
        if (cancelled) return;
        setEntries(entriesRes.data);
        setTypeInfo(typesRes.data.find((t) => t.slug === postType) || null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
        setError(message || "Failed to load entries. Please check if the backend is running and you are logged in.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postType, refreshKey]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `"${title}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await cptService.deleteEntry(id);
        toast.success("Entry deleted successfully");
        setRefreshKey((k) => k + 1);
      } catch (err) {
        const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
        toast.error(message || "Failed to delete entry");
      }
    }
  };

  const columns = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "featured_image_url",
      label: "Image",
      render: (val: any, row: CptEntry) =>
        val ? (
          <div className="rounded-3 overflow-hidden border shadow-sm" style={{ width: "50px", height: "50px" }}>
            <img src={val} alt={row.title} className="w-100 h-100" style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center text-muted" style={{ width: "50px", height: "50px" }}>
            <FaLayerGroup size={18} className="opacity-25" />
          </div>
        ),
    },
    { key: "title", label: "Title", sortable: true, render: (val: any) => <span className="fw-semibold text-dark">{val}</span> },
    { key: "slug", label: "Slug", sortable: true, render: (val: any) => <span className="text-muted">/{postType}/{val}</span> },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === "published" ? "success" : "warning"} bg-opacity-10 text-${val === "published" ? "success" : "warning"}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      sortable: true,
      render: (val: any) => (val ? new Date(val).toLocaleDateString() : "N/A"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, row: CptEntry) => (
        <div className="d-flex justify-content-end gap-2">
          {typeInfo?.is_public === 1 && (
            <a
              href={`/${postType}/${row.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center"
              title="View"
              style={{ width: "40px", height: "40px" }}
            >
              <FaEye size={16} className="text-muted" />
            </a>
          )}
          <Link
            href={`/${adminPath}/cpt/${postType}/edit/${row.id}`}
            className="btn btn-light border text-primary rounded-4 d-flex align-items-center justify-content-center"
            title="Edit"
            style={{ width: "40px", height: "40px" }}
          >
            <FaEdit size={16} />
          </Link>
          <button
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center"
            title="Delete"
            style={{ width: "40px", height: "40px" }}
            onClick={() => handleDelete(row.id, row.title)}
          >
            <FaTrash size={16} />
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
          <h2 className="fw-bold">{typeInfo?.label || "Entries"}</h2>
          <p className="text-muted">{typeInfo?.description || `Manage ${postType} entries.`}</p>
        </div>
        <Link href={`/${adminPath}/cpt/${postType}/create`} className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Add New {typeInfo?.singular_label || ""}
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading entries...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            searchPlaceholder="Search by title or slug..."
            searchKeys={["title", "slug"]}
            defaultSortKey="id"
            defaultSortDirection="desc"
            defaultRowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
