
"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUser, FaTwitter, FaLinkedin, FaGlobe, FaSave } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAuthors, createAuthor, updateAuthor, deleteAuthor } from "@/store/slices/userSlice";
import { Author } from "@/services/authors.service";
import toast from "react-hot-toast";
import MediaLibraryModal from "@/components/admin/common/MediaLibraryModal";
import Image from "next/image";

export default function AuthorsManagement() {
  const dispatch = useAppDispatch();
  const { authors, isLoading, isSaving } = useAppSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  
  const [formData, setFormData] = useState<Partial<Author>>({
    name: "",
    email: "",
    bio: "",
    details: "",
    social_links: {
      twitter: "",
      linkedin: "",
      website: ""
    },
    profile_image_id: undefined,
    profile_image_path: ""
  });

  useEffect(() => {
    dispatch(fetchAuthors());
  }, [dispatch]);

  const handleEdit = async (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name || "",
      email: author.email || "",
      bio: author.bio || "",
      details: author.details || "",
      social_links: {
        twitter: author.social_links?.twitter || "",
        linkedin: author.social_links?.linkedin || "",
        website: author.social_links?.website || ""
      },
      profile_image_id: author.profile_image_id,
      profile_image_path: author.profile_image_path
    });
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const socialKey = name.replace("social_", "");
      setFormData(prev => ({
        ...prev,
        social_links: { ...prev.social_links, [socialKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAuthor && editingAuthor.id) {
      dispatch(updateAuthor({ id: editingAuthor.id, data: formData }))
        .unwrap()
        .then(() => {
          toast.success("Author updated successfully");
          setIsModalOpen(false);
        })
        .catch((err) => toast.error(err || "Failed to update author"));
    } else {
      dispatch(createAuthor(formData))
        .unwrap()
        .then(() => {
          toast.success("Author created successfully");
          setIsModalOpen(false);
        })
        .catch((err) => toast.error(err || "Failed to create author"));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteAuthor(id))
        .unwrap()
        .then(() => toast.success("Author deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete author"));
    }
  };

  const handleImageSelect = (media: any) => {
    setFormData(prev => ({
      ...prev,
      profile_image_id: media.id,
      profile_image_path: media.url
    }));
    setIsMediaModalOpen(false);
  };

  if (isLoading && !authors.length) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Blog Authors</h2>
          <p className="text-muted">Manage the profiles of people who write for your blog.</p>
        </div>
        <button 
          onClick={() => { 
            setEditingAuthor(null); 
            setFormData({
              name: "",
              email: "",
              bio: "",
              details: "",
              social_links: { twitter: "", linkedin: "", website: "" },
              profile_image_id: undefined,
              profile_image_path: ""
            });
            setIsModalOpen(true); 
          }}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FaPlus /> Add New Author
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Author</th>
                <th className="py-3">Email</th>
                <th className="py-3">Social</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.length > 0 ? authors.map((author: Author) => (
                <tr key={author.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      {author.profile_image_path ? (
                        <Image 
                          src={author.profile_image_path} 
                          alt={author.name} 
                          width={40} 
                          height={40} 
                          className="rounded-circle object-fit-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                          <FaUser className="text-muted" />
                        </div>
                      )}
                      <div>
                        <div className="fw-bold">{author.name}</div>
                        <div className="small text-muted">/{author.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{author.email}</td>
                  <td className="py-3">
                    <div className="d-flex gap-2">
                      {author.social_links?.twitter && <FaTwitter className="text-primary" />}
                      {author.social_links?.linkedin && <FaLinkedin className="text-primary" />}
                      {author.social_links?.website && <FaGlobe className="text-success" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(author)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => author.id && handleDelete(author.id, author.name)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">No authors found. Create your first author!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Edit Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingAuthor ? "Edit Author Profile" : "Add New Author"}</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-3 text-center mb-3">
                      <label className="form-label fw-semibold d-block">Avatar</label>
                      <div 
                        className="mx-auto bg-light border rounded-circle d-flex align-items-center justify-content-center cursor-pointer mb-2" 
                        style={{ width: "100px", height: "100px", overflow: "hidden" }}
                        onClick={() => setIsMediaModalOpen(true)}
                      >
                        {formData.profile_image_path ? (
                          <Image src={formData.profile_image_path} alt="Avatar" width={100} height={100} className="object-fit-cover" unoptimized />
                        ) : (
                          <FaUser className="text-muted fs-2" />
                        )}
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setIsMediaModalOpen(true)}>Change</button>
                    </div>
                    <div className="col-md-9">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            required
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            required
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Short Bio</label>
                          <textarea
                            name="bio"
                            className="form-control"
                            rows={2}
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="A brief introduction..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Full Details / Story</label>
                      <textarea
                        name="details"
                        className="form-control"
                        rows={4}
                        value={formData.details}
                        onChange={handleChange}
                        placeholder="Detailed background information..."
                      ></textarea>
                    </div>
                    
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold border-bottom pb-2">Social Links</h6>
                    </div>
                    
                    <div className="col-md-4">
                      <label className="form-label small">Twitter URL</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text text-primary"><FaTwitter /></span>
                        <input
                          type="text"
                          name="social_twitter"
                          className="form-control"
                          value={formData.social_links?.twitter}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">LinkedIn URL</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text text-primary"><FaLinkedin /></span>
                        <input
                          type="text"
                          name="social_linkedin"
                          className="form-control"
                          value={formData.social_links?.linkedin}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Website URL</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text text-success"><FaGlobe /></span>
                        <input
                          type="text"
                          name="social_website"
                          className="form-control"
                          value={formData.social_links?.website}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={isSaving}
                  >
                    <FaSave /> {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
