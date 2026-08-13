"use client";
import Swal from 'sweetalert2';
import React, { useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPages, deletePage } from "@/store/slices/pageSlice";
import { Page } from "@/services/pages.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function PagesManagement() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { pages, isLoading, error } = useAppSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deletePage(id))
        .unwrap()
        .then(() => toast.success("Page deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete page"));
    }
  };

  const columns = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "featured_image_url",
      label: "Image",
      render: (val: any, page: Page) => val ? (
        <div className="rounded-3 overflow-hidden border shadow-sm" style={{ width: '50px', height: '50px' }}>
          <img src={val} alt={page.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center text-muted" style={{ width: '50px', height: '50px' }}>
          <FaFileAlt size={18} className="opacity-25" />
        </div>
      )
    },
    { key: "title", label: "Page Title", sortable: true, render: (val: any) => <span className="fw-semibold text-dark">{val}</span> },
    { key: "slug", label: "Slug", sortable: true, render: (val: any) => <span className="text-muted">/{val}</span> },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === 'published' ? 'success' : 'warning'} bg-opacity-10 text-${val === 'published' ? 'success' : 'warning'}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      )
    },
    {
      key: "created_at",
      label: "Created Date",
      sortable: true,
      render: (val: any) => val ? new Date(val).toLocaleDateString() : 'N/A'
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, page: Page) => (
        <div className="d-flex justify-content-end gap-2">
          <a
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center"
            title="View Page"
            style={{ width: '40px', height: '40px' }}
          >
            <FaEye size={30} className="text-muted" />
          </a>
          <Link
            href={`/${adminPath}/pages/edit/${page.id}`}
            className="btn btn-light border text-primary rounded-4 d-flex align-items-center justify-content-center"
            title="Edit Page"
            style={{ width: '40px', height: '40px' }}
          >
            <FaEdit size={30} />
          </Link>
          <button
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center"
            title="Delete Page"
            style={{ width: '40px', height: '40px ' }}
            onClick={() => handleDelete(page.id, page.title)}
          >
            <FaTrash size={30} />
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}. Please check if the backend is running and you are logged in.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Pages</h2>
          <p className="text-muted">Manage your website pages and their content.</p>
        </div>
        <Link href={`/${adminPath}/pages/create`} className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Create New Page
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading pages...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={pages}
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
