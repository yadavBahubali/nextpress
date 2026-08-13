"use client";
import Swal from 'sweetalert2';
import React, { useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaListAlt, FaSearch } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchForms, deleteForm } from "@/store/slices/formSlice";
import { Form } from "@/services/forms.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function FormsManagement() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { forms, isLoading, error } = useAppSelector((state) => state.forms);

  useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteForm(id))
        .unwrap()
        .then(() => toast.success("Form deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete form"));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Form Title",
      sortable: true,
      render: (val: any) => (
        <div className="d-flex align-items-center gap-3">
          <div className="rounded bg-primary bg-opacity-10 p-2 text-primary">
            <FaListAlt size={18} />
          </div>
          <span className="fw-semibold text-dark">{val}</span>
        </div>
      )
    },
    { key: "slug", label: "Slug", sortable: true, render: (val: any) => <code>{val}</code> },
    {
      key: "fields",
      label: "Fields",
      render: (val: any) => (
        <span className="badge bg-light text-dark border">{val?.length || 0} Fields</span>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === 'active' ? 'success' : 'secondary'} bg-opacity-10 text-${val === 'active' ? 'success' : 'secondary'}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      )
    },
    {
      key: "updated_at",
      label: "Last Updated",
      sortable: true,
      render: (val: any) => val ? new Date(val).toLocaleDateString() : 'N/A'
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, form: Form) => (
        <div className="d-flex justify-content-end gap-2">
          <Link
            href={`/${adminPath}/forms/submissions?formId=${form.id}`}
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center"
            title="View Submissions"
            style={{ width: '40px', height: '40px' }}
          >
            <FaSearch size={14} className="text-muted" />
          </Link>
          <Link
            href={`/${adminPath}/forms/edit/${form.id}`}
            className="btn btn-light border text-primary rounded-4 d-flex align-items-center justify-content-center"
            title="Edit Form"
            style={{ width: '40px', height: '40px' }}
          >
            <FaEdit size={14} />
          </Link>
          <button
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center"
            title="Delete Form"
            style={{ width: '40px', height: '40px' }}
            onClick={() => handleDelete(form.id, form.title)}
          >
            <FaTrash size={14} />
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          {error}. Please check if the backend is running and you are logged in.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Form Management</h2>
          <p className="text-muted">Create and manage dynamic forms for your website.</p>
        </div>
        <Link href={`/${adminPath}/forms/create`} className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Create New Form
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading forms...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={forms}
            searchPlaceholder="Search by title or slug..."
            searchKeys={["title", "slug"]}
            defaultSortKey="title"
            defaultRowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
