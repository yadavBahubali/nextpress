"use client";

import React, { useState, useMemo } from "react";
import { useAppDispatch } from "@/store";
import { deleteFieldGroup } from "@/store/slices/acfSlice";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  data?: any[];
}

const StatusBadge = ({ status }: { status?: string }) => {
  const isActive = status === "active";
  return (
    <div className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1 ${isActive ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      <span style={{ fontSize: '0.7rem' }}>{isActive ? "Active" : "Inactive"}</span>
    </div>
  );
};

export default function FieldGroupTable({ data = [] }: Props) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const filteredData = useMemo(() => {
    return data.filter(group => 
      group.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.group_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleDeleteGroup = (id: any, title: string) => {
    if (window.confirm(`Are you sure you want to delete the field group "${title}"?`)) {
      dispatch(deleteFieldGroup(id))
        .unwrap()
        .then(() => toast.success("Field group deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete group"));
    }
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(g => g.id)));
    }
  };

  const toggleRowSelection = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="container-fluid py-2">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <h2 className="h4 mb-1 fw-bold text-dark">Field Groups</h2>
          <p className="text-secondary mb-0 small">
            Manage and organize your custom field configurations.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            href={`/${adminPath}/acf/create`}
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold shadow-sm rounded-3"
          >
            <Plus size={16} />
            New Group
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Table Toolbar */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div
              className="position-relative"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              <Search
                className="position-absolute text-muted"
                size={16}
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control ps-5 bg-light border-0 py-2 rounded-3"
                style={{ boxShadow: "none" }}
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-light border rounded-3 d-flex align-items-center gap-2 text-secondary fw-medium">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom">
              <tr>
                <th scope="col" className="px-4 py-3 text-center" style={{ width: "60px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input mt-0 border-secondary"
                    checked={filteredData.length > 0 && selectedRows.size === filteredData.length}
                    onChange={toggleAll}
                  />
                </th>
                <th scope="col" className="py-3 text-uppercase text-secondary small fw-bold">Title & Key</th>
                <th scope="col" className="py-3 text-uppercase text-secondary small fw-bold d-none d-lg-table-cell">Description</th>
                <th scope="col" className="py-3 text-uppercase text-secondary small fw-bold text-center">Status</th>
                <th scope="col" className="py-3 text-uppercase text-secondary small fw-bold text-center">Fields</th>
                <th scope="col" className="py-3 px-4 text-end" style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((group) => { 
                  const isSelected = selectedRows.has(group.id);
                  return (
                    <tr key={group.id} className={isSelected ? "table-primary bg-opacity-10" : ""}>
                      <td className="px-4 text-center">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0 border-secondary"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(group.id)}
                        />
                      </td>
                      <td className="py-3">
                        <div className="d-flex flex-column">
                          <Link 
                            href={`/${adminPath}/acf/edit/${group.id}`}
                            className="text-decoration-none fw-bold text-dark hover-primary"
                          >
                            {group.title || "Untitled"}
                          </Link>
                          <span className="text-secondary small font-monospace">
                            {group.group_key || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="d-none d-lg-table-cell text-secondary text-truncate small" style={{ maxWidth: "300px" }}>
                        {group.description || "-"}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={group.status} />
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border rounded-pill px-2">
                          {group.fieldsCount || 0}
                        </span>
                      </td>
                      <td className="px-4 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Link
                            href={`/${adminPath}/acf/edit/${group.id}`}
                            className="btn btn-sm btn-light border rounded-circle p-1 text-primary"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            className="btn btn-sm btn-light border rounded-circle p-1 text-danger"
                            title="Delete group"
                            onClick={() => handleDeleteGroup(group.id, group.title)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-5 text-center">
                    <div className="d-flex flex-column align-items-center py-4">
                      <div className="bg-light rounded-circle p-3 mb-3">
                        <Plus size={24} className="text-secondary" />
                      </div>
                      <h5 className="text-dark fw-semibold mb-1 fs-6">
                        {data.length === 0 ? "No field groups available" : "No field groups found"}
                      </h5>
                      <p className="text-secondary small">
                        {data.length === 0 ? "Get started by creating a new field group." : "Try adjusting your search terms."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <p className="text-secondary small mb-0">
            Showing <span className="fw-semibold text-dark">{filteredData.length}</span> of <span className="fw-semibold text-dark">{data.length}</span> results
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .hover-primary:hover {
          color: var(--bs-primary) !important;
        }
      `}</style>
    </div>
  );
}
