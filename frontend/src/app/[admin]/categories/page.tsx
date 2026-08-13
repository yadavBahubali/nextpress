"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFolder } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCategories } from "@/store/slices/ecommerceSlice";
import ecommerceService, { Category } from "@/services/ecommerce.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function CategoriesManagement() {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.ecommerce);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [newCatData, setNewCatData] = useState<Partial<Category>>({
    name: '', slug: '', description: '', parent_id: null
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setNewCatData(cat);
    } else {
      setEditingCategory(null);
      setNewCatData({ name: '', slug: '', description: '', parent_id: null });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!newCatData.name || !newCatData.slug) {
        toast.error("Name and Slug are required");
        return;
      }
      if (editingCategory?.id) {
        await ecommerceService.updateCategory(editingCategory.id, newCatData);
        toast.success("Category updated");
      } else {
        await ecommerceService.createCategory(newCatData);
        toast.success("Category created");
      }
      setIsModalOpen(false);
      dispatch(fetchCategories());
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      try {
        await ecommerceService.deleteCategory(id);
        toast.success("Category deleted");
        dispatch(fetchCategories());
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (val: any) => (
        <div className="d-flex align-items-center gap-2 fw-bold text-dark">
          <FaFolder className="text-warning" /> {val}
        </div>
      )
    },
    { key: "slug", label: "Slug", sortable: true, render: (val: any) => <code>{val}</code> },
    {
      key: "parent_id",
      label: "Parent",
      render: (val: any) => val ? (
        <span className="badge bg-light text-dark border">
          {categories.find(c => c.id === val)?.name || 'Unknown'}
        </span>
      ) : (
        <span className="text-muted small">—</span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, cat: Category) => (
        <div className="d-flex justify-content-end gap-2">
          <button onClick={() => handleOpenModal(cat)} className="btn btn-sm btn-light border text-primary">
            <FaEdit />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-light border text-danger">
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
          <h2 className="fw-bold">Product Categories</h2>
          <p className="text-muted">Organize your products into logical groups.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 rounded-3">
          <FaPlus size={14} /> Add New Category
        </button>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading categories...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            searchPlaceholder="Search categories..."
            searchKeys={["name", "slug"]}
            defaultSortKey="name"
            defaultRowsPerPage={10}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pt-4 px-4">
                <h5 className="modal-title fw-bold">{editingCategory ? 'Edit Category' : 'Create Category'}</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCatData.name}
                    onChange={e => {
                      const val = e.target.value;
                      setNewCatData(prev => ({ ...prev, name: val, slug: editingCategory ? prev.slug : generateSlug(val) }));
                    }}
                    placeholder="e.g. Interactive Boards"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCatData.slug}
                    onChange={e => setNewCatData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Parent Category</label>
                  <select
                    className="form-select"
                    value={newCatData.parent_id || ''}
                    onChange={e => setNewCatData(prev => ({ ...prev, parent_id: e.target.value ? parseInt(e.target.value) : null }))}
                  >
                    <option value="">-- None (Top Level) --</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newCatData.description || ''}
                    onChange={e => setNewCatData(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0 pb-4 px-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary px-4" onClick={handleSave}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
