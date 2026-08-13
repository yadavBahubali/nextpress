
"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/store/slices/blogSlice";
import { Plus, Edit2, Trash2, Search, Folder, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function BlogCategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.blogs);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from name if not manually editing slug
      if (name === "name" && !editingId) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, data: formData })).unwrap();
        toast.success("Category updated");
      } else {
        await dispatch(createCategory(formData)).unwrap();
        toast.success("Category created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err || "Operation failed");
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || ""
    });
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        toast.success("Category deleted");
      } catch (err: any) {
        toast.error(err || "Delete failed");
      }
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 p-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="mb-5">
        <h2 className="fw-bold mb-1">Categories</h2>
        <p className="text-muted small">Organize your enterprise stories into meaningful taxonomies.</p>
      </div>

      <div className="row g-4">
        {/* ADD/EDIT FORM */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                {editingId ? <Edit2 size={18} className="text-primary" /> : <Plus size={18} className="text-primary" />}
                {editingId ? "Edit Category" : "Add New Category"}
              </h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control bg-light border-0 shadow-none" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Technology"
                  />
                  <div className="form-text x-small mt-1">The name is how it appears on your site.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase text-muted">Slug</label>
                  <input 
                    type="text" 
                    name="slug"
                    className="form-control bg-light border-0 shadow-none font-monospace" 
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="technology"
                  />
                  <div className="form-text x-small mt-1">The “slug” is the URL-friendly version of the name.</div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Description</label>
                  <textarea 
                    name="description"
                    className="form-control bg-light border-0 shadow-none" 
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What is this category about?"
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1 rounded-pill fw-bold py-2 shadow-sm">
                    {editingId ? "Update Category" : "Add Category"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="btn btn-light border rounded-pill px-3">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          <div className="alert alert-light border-0 shadow-sm rounded-4 mt-4 p-4">
             <div className="d-flex gap-3">
               <Info size={20} className="text-primary flex-shrink-0" />
               <div className="small text-muted">
                 <strong>Pro Tip:</strong> Categories help your users find related content easily. Keep them broad and use Tags for specific details.
               </div>
             </div>
          </div>
        </div>

        {/* LIST TABLE */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden border">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Manage Categories</h6>
              <div className="position-relative" style={{ width: '200px' }}>
                <Search className="position-absolute top-50 translate-middle-y start-0 ms-2 text-muted" size={14} />
                <input 
                  type="text" 
                  className="form-control form-control-sm ps-4 rounded-pill bg-light border-0" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th className="px-4 py-3 border-0 small text-uppercase text-muted fw-bold">Name</th>
                    <th className="py-3 border-0 small text-uppercase text-muted fw-bold">Slug</th>
                    <th className="py-3 border-0 small text-uppercase text-muted fw-bold">Count</th>
                    <th className="px-4 py-3 border-0 text-end small text-uppercase text-muted fw-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      </td>
                    </tr>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat: any) => (
                      <tr key={cat.id} className="border-bottom border-light transition-all">
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                              <Folder size={16} />
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{cat.name}</div>
                              {cat.description && <div className="text-muted x-small line-clamp-1">{cat.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <code className="x-small bg-light px-2 py-1 rounded text-primary">{cat.slug}</code>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-light text-dark fw-bold border rounded-pill px-3">{cat.post_count || 0}</span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button onClick={() => handleEdit(cat)} className="btn btn-sm btn-white border shadow-sm p-2 rounded-3 hover-text-primary transition-all">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(cat.id, cat.name)} className="btn btn-sm btn-white border shadow-sm p-2 rounded-3 text-danger hover-bg-danger hover-text-white transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">
                        No categories found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .x-small { font-size: 0.72rem; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .btn-white { background: white; }
        .btn-white:hover { background: #f8f9fa; }
        .transition-all { transition: all 0.2s; }
      `}</style>
    </div>
  );
}
