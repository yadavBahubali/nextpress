"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchAllMenus, createMenu, deleteMenu } from '@/store/slices/menuSlice';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBars } from 'react-icons/fa';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MenuList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMenuData, setNewMenuData] = useState({ name: "", location: "" });
  
  const params = useParams();
  const router = useRouter();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { allMenus: menus, isLoading, isSaving, error } = useAppSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchAllMenus());
  }, [dispatch]);

  // Logic to find "Remaining Options" for locations
  const ALL_LOCATIONS = [
    { id: 'header_main', label: 'Main Header' },
    { id: 'header_top', label: 'Top Bar Header' },
    { id: 'footer_column_1', label: 'Footer Column 1' },
    { id: 'footer_column_2', label: 'Footer Column 2' },
    { id: 'footer_column_3', label: 'Footer Column 3' },
    { id: 'footer_bottom', label: 'Footer Bottom Bar' },
    { id: 'sidebar_main', label: 'Main Sidebar' },
    { id: 'mobile_nav', label: 'Mobile Navigation' },
  ];

  const takenLocations = new Set(menus.map(m => m.location).filter(Boolean));
  const availableLocations = ALL_LOCATIONS.filter(loc => !takenLocations.has(loc.id));

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteMenu(id))
        .unwrap()
        .then(() => toast.success("Menu deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete menu"));
    }
  };

  const filteredMenus = menus.filter((menu) => 
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (menu.location && menu.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuData.name) {
      toast.error("Please enter a menu name");
      return;
    }
    
    dispatch(createMenu(newMenuData))
      .unwrap()
      .then((res) => {
        toast.success("Menu created! Opening builder...");
        setIsCreateModalOpen(false);
        router.push(`/${adminPath}/appearance/menus?id=${res.id}`);
      })
      .catch((err) => toast.error(err || "Failed to create menu"));
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">Failed to load menus: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Navigation Menus</h2>
          <p className="text-muted">Create and manage your website navigation structures.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4"
        >
          <FaPlus /> Create New Menu
        </button>
      </div>

      {/* Create Menu Modal */}
      {isCreateModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Menu</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setIsCreateModalOpen(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body py-4">
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Menu Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg shadow-none border-2" 
                      placeholder="e.g. Primary Navigation"
                      value={newMenuData.name}
                      onChange={(e) => setNewMenuData(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  
                  <div className="mb-0">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-3">Assign to Remaining Location (Optional)</label>
                    <div className="row g-2">
                      <div className="col-12">
                        <div 
                          className={`p-2 rounded border border-2 cursor-pointer transition-all mb-2 ${!newMenuData.location ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
                          onClick={() => setNewMenuData(prev => ({ ...prev, location: "" }))}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div className={`rounded-circle border border-2 d-flex align-items-center justify-content-center`} style={{ width: '18px', height: '18px' }}>
                              {!newMenuData.location && <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                            </div>
                            <span className="small fw-bold">No Location (Draft)</span>
                          </div>
                        </div>
                      </div>
                      
                      {availableLocations.map(loc => (
                        <div className="col-md-6" key={loc.id}>
                          <div 
                            className={`p-2 h-100 rounded border border-2 cursor-pointer transition-all ${newMenuData.location === loc.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle hover-border-secondary'}`}
                            onClick={() => setNewMenuData(prev => ({ ...prev, location: loc.id }))}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div className={`rounded-circle border border-2 d-flex align-items-center justify-content-center`} style={{ width: '18px', height: '18px' }}>
                                {newMenuData.location === loc.id && <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                              </div>
                              <span className="small fw-medium">{loc.label}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {availableLocations.length === 0 && (
                      <div className="alert alert-light border text-muted x-small mb-0 mt-2">
                        All theme locations are currently assigned to other menus.
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 pb-4 justify-content-center">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : null}
                    Create Menu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-12">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search menus by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3" style={{ width: '60px' }}>Icon</th>
                <th className="py-3">Menu Name</th>
                <th className="py-3">Display Location</th>
                <th className="py-3">Items</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading menus...
                  </td>
                </tr>
              ) : filteredMenus.length > 0 ? (
                filteredMenus.map((menu) => (
                  <tr key={menu.id}>
                    <td className="px-4 py-3 text-muted">
                      <FaBars size={20} className="opacity-25" />
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">{menu.name}</div>
                      <div className="x-small text-info font-monospace mt-1">{menu.slug}</div>
                    </td>
                    <td className="py-3">
                      {menu.location ? (
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {menu.location.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-muted small">Not assigned</span>
                      )}
                    </td>
                    <td className="py-3 text-muted">
                      {menu.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Link 
                          href={`/${adminPath}/appearance/menus?id=${menu.id}`} 
                          className="btn btn-light border rounded-circle p-2 text-primary" 
                          title="Open Menu Builder"
                        >
                          <FaEdit size={14} />
                        </Link>
                        <button 
                          className="btn btn-light border rounded-circle p-2 text-danger" 
                          title="Delete Menu"
                          onClick={() => handleDelete(menu.id, menu.name)}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No menus found. Create your first menu to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
