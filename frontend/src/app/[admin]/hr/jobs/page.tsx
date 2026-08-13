"use client";
import Swal from 'sweetalert2';
import React, { useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaBriefcase, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchJobs, deleteJob } from "@/store/slices/careerSlice";
import { Job } from "@/services/careers.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function JobBoardManager() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { jobs, isLoading, error } = useAppSelector((state) => state.careers);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteJob(id))
        .unwrap()
        .then(() => toast.success("Job deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete job"));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Position Title",
      sortable: true,
      render: (val: any, job: Job) => (
        <div>
          <div className="fw-bold text-dark">{job.title}</div>
          <div className="small text-muted"><code>/{job.slug}</code></div>
        </div>
      )
    },
    { key: "department", label: "Department", sortable: true, render: (val: any) => val || 'N/A' },
    {
      key: "location",
      label: "Location / Type",
      render: (val: any, job: Job) => (
        <div>
          <div className="small d-flex align-items-center gap-1 mb-1">
            <FaMapMarkerAlt className="text-muted" /> {job.location || 'Remote'}
          </div>
          <span className="badge bg-light text-dark border text-capitalize">{job.type?.replace('-', ' ')}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <span className={`badge rounded-pill px-3 py-2 bg-${val === 'published' ? 'success' : val === 'draft' ? 'warning' : 'secondary'} bg-opacity-10 text-${val === 'published' ? 'success' : val === 'draft' ? 'warning' : 'secondary'}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      )
    },
    {
      key: "created_at",
      label: "Posted On",
      sortable: true,
      render: (val: any) => <span className="text-muted small">{new Date(val).toLocaleDateString()}</span>
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, job: Job) => (
        <div className="d-flex justify-content-end gap-2">
          <Link
            href={`/${adminPath}/hr/applications?jobId=${job.id}`}
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center text-primary"
            title="View Applicants"
            style={{ width: '32px', height: '32px' }}
          >
            <FaUsers size={14} />
          </Link>
          <Link
            href={`/${adminPath}/hr/jobs/edit/${job.id}`}
            className="btn btn-light border rounded-4 d-flex align-items-center justify-content-center"
            title="Edit Job"
            style={{ width: '32px', height: '32px' }}
          >
            <FaEdit size={14} />
          </Link>
          <button
            className="btn btn-light border text-danger rounded-4 d-flex align-items-center justify-content-center"
            title="Delete Job"
            style={{ width: '32px', height: '32px' }}
            onClick={() => handleDelete(job.id, job.title)}
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
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Job Board Manager</h2>
          <p className="text-muted">Create and manage open positions on your careers page.</p>
        </div>
        <Link href={`/${adminPath}/hr/jobs/create`} className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Post New Job
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading jobs...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={jobs}
            searchPlaceholder="Search by title or department..."
            searchKeys={["title", "department", "location"]}
            defaultSortKey="title"
            defaultRowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
