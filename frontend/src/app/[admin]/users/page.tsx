"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUserShield, FaUserEdit, FaPlus, FaSave } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUsers, createUser, updateUser, deleteUser } from "@/store/slices/userSlice";
import { User } from "@/services/users.service";
import { permissionsService, GrantableSection } from "@/services/permissions.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

// Editor and Staff Viewer are the two roles with per-user, checkbox-granted
// section access (see modules/permissions on the backend). Super Admin/Admin
// always have everything; role 4 (public/customer) never gets admin access
// regardless of any grant, so it's intentionally not configurable here.
const CONFIGURABLE_ROLE_IDS = ["3", "5"];

export default function AllUsers() {
  const dispatch = useAppDispatch();
  const { users, isLoading, isSaving } = useAppSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "2", // role_id as string for select
    password: "",
  });

  const [sections, setSections] = useState<GrantableSection[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    permissionsService.getSections().then(setSections).catch(() => {});
  }, [dispatch]);

  const isConfigurableRole = (role: string) => CONFIGURABLE_ROLE_IDS.includes(role);

  const handleEdit = async (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role_id.toString(),
      password: "", // Keep password empty unless changing
    });

    if (isConfigurableRole(user.role_id.toString())) {
      setPermissionsLoading(true);
      try {
        setSelectedPermissions(await permissionsService.getForUser(user.id));
      } catch {
        setSelectedPermissions([]);
      } finally {
        setPermissionsLoading(false);
      }
    } else {
      setSelectedPermissions([]);
    }

    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "2",
      password: "",
    });
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "role" && !isConfigurableRole(value)) {
      setSelectedPermissions([]);
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const saveSectionPermissions = async (userId: number) => {
    if (isConfigurableRole(formData.role)) {
      await permissionsService.setForUser(userId, selectedPermissions);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;
      dispatch(updateUser({ id: editingUser.id, data: updateData }))
        .unwrap()
        .then(async (updated) => {
          await saveSectionPermissions(updated.id);
          toast.success("User updated successfully");
          setIsModalOpen(false);
        })
        .catch((err) => toast.error(err || "Failed to update user"));
    } else {
      dispatch(createUser(formData))
        .unwrap()
        .then(async (created) => {
          await saveSectionPermissions(created.id);
          toast.success("User created successfully");
          setIsModalOpen(false);
        })
        .catch((err) => toast.error(err || "Failed to create user"));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => toast.success("User deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete user"));
    }
  };

  const getRoleBadge = (role_id: number) => {
    const map: Record<number, { label: string; color: string }> = {
      1: { label: 'Super Admin', color: 'danger' },
      2: { label: 'Admin', color: 'primary' },
      3: { label: 'Editor', color: 'success' },
      4: { label: 'Customer', color: 'secondary' },
      5: { label: 'Viewer (Staff)', color: 'info' },
    };
    const r = map[role_id] || { label: 'Unknown', color: 'secondary' };
    return (
      <span className={`badge bg-${r.color} bg-opacity-10 text-${r.color} text-uppercase`} style={{ fontSize: '0.7rem' }}>
        {r.label}
      </span>
    );
  };

  const columns = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (val: any) => (
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <FaUserShield />
          </div>
          <span className="fw-bold">{val}</span>
        </div>
      )
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_id",
      label: "Role",
      sortable: true,
      render: (val: any) => getRoleBadge(val)
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (val: any) => <span className="text-muted small">{new Date(val).toLocaleDateString()}</span>
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, user: User) => (
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(user)}
            title="Edit User"
          >
            <FaUserEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(user.id, user.name)}
            disabled={user.id === 1}
            title={user.id === 1 ? "Super-Admin cannot be deleted" : "Delete User"}
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">All Users</h2>
          <p className="text-muted">Manage system administrators and editors.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FaPlus /> Add New User
        </button>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading && !users.length ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search by name or email..."
            searchKeys={["name", "email"]}
            defaultSortKey="name"
            defaultRowsPerPage={10}
          />
        )}
      </div>

      {/* User Drawer (Add/Edit) */}
      {isModalOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className="position-fixed top-0 end-0 h-100 bg-white shadow d-flex flex-column user-drawer"
            style={{ width: "min(480px, 100vw)", zIndex: 1051 }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom p-4">
              <h5 className="fw-bold mb-0">{editingUser ? "Edit User" : "Add New User"}</h5>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
            </div>
            <form onSubmit={handleSave} className="d-flex flex-column flex-grow-1 overflow-hidden">
              <div className="flex-grow-1 overflow-auto p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="1">Super Admin</option>
                      <option value="2">Admin</option>
                      <option value="3">Editor - create, edit, update</option>
                      <option value="5">Viewer (Staff) - read only</option>
                      <option value="4">Customer</option>
                    </select>
                  </div>

                  {isConfigurableRole(formData.role) && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Section Access
                      </label>
                      <div className="form-text small mb-2">
                        Check every section this user can see. {formData.role === "3"
                          ? "As an Editor they'll get full create/edit/update access to each one."
                          : "As a Viewer they'll get read-only access to each one."}
                      </div>
                      {permissionsLoading ? (
                        <div className="text-muted small">Loading current access...</div>
                      ) : (
                        <div className="border rounded-3 p-3" style={{ maxHeight: "220px", overflowY: "auto" }}>
                          {sections.map((section) => (
                            <div className="form-check" key={section.key}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`perm_${section.key}`}
                                checked={selectedPermissions.includes(section.key)}
                                onChange={() => togglePermission(section.key)}
                              />
                              <label className="form-check-label small" htmlFor={`perm_${section.key}`}>
                                {section.label}
                              </label>
                            </div>
                          ))}
                          {sections.length === 0 && (
                            <div className="text-muted small">No configurable sections found.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-0">
                    <label className="form-label fw-semibold">
                      {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      required={!editingUser}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    {!editingUser && <div className="form-text small">Default: NextPress123! if left blank.</div>}
                  </div>
              </div>
              <div className="border-top p-3 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={isSaving}
                >
                  <FaSave /> {editingUser
                    ? (isSaving ? "Updating..." : "Save Changes")
                    : (isSaving ? "Creating..." : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <style jsx>{`
        .user-drawer {
          animation: slideInDrawer 0.2s ease-out;
        }
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
