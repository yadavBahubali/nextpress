"use client";
import Swal from 'sweetalert2';
import React, { useEffect } from "react";
import { 
  Plus, Edit, Trash2, FileText, Calendar
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPosts, deletePost } from "@/store/slices/blogSlice";
import { Post } from "@/services/blogs.service";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/common/DataTable";

export default function BlogsManagement() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const dispatch = useAppDispatch();
  const { posts, isLoading, error } = useAppSelector((state) => state.blogs);

  // Fetch blogs on mount
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deletePost(id))
        .unwrap()
        .then(() => toast.success("Blog post deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete blog post"));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Post Information",
      sortable: true,
      render: (val: any, post: Post) => (
        <div className="d-flex align-items-center gap-3">
          <div className="flex-shrink-0">
            {post.featured_image_url ? (
              <img 
                src={post.featured_image_url} 
                alt="" 
                className="rounded-3 shadow-sm border" 
                style={{ width: '56px', height: '56px', objectFit: 'cover' }} 
              />
            ) : (
              <div className="bg-light rounded-3 d-flex align-items-center justify-content-center border" style={{ width: '56px', height: '56px' }}>
                <FileText className="text-muted opacity-25" size={24} />
              </div>
            )}
          </div>
          <div>
            <div className="fw-bold text-dark h6 mb-1">{post.title}</div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-primary x-small fw-medium bg-primary bg-opacity-10 px-2 rounded">/{post.slug}</span>
              <span className="text-muted opacity-50">|</span>
              <div className="d-flex align-items-center gap-1 text-muted x-small">
                <Calendar size={12} className="opacity-50" /> 
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: "author_name",
      label: "Author",
      sortable: true,
      render: (val: any) => (
        <div className="d-flex align-items-center gap-2">
          <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
            {(val || 'A').charAt(0).toUpperCase()}
          </div>
          <span className="small fw-medium text-dark">{val || 'Administrator'}</span>
        </div>
      )
    },
    {
      key: "categories",
      label: "Categories",
      render: (val: any) => (
        <div className="d-flex flex-wrap gap-1">
          {val && val.length > 0 ? (
            val.map((cat: any) => (
              <span key={cat.id} className="badge bg-light text-secondary fw-medium border x-small rounded-pill px-2">{cat.name}</span>
            ))
          ) : (
            <span className="text-muted x-small italic opacity-75">Uncategorized</span>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val: any) => (
        <div className={`d-inline-flex align-items-center gap-1 badge rounded-pill px-3 py-1 bg-${val === 'published' ? 'success' : 'warning'} bg-opacity-10 text-${val === 'published' ? 'success' : 'warning'} border border-${val === 'published' ? 'success' : 'warning'} border-opacity-25`}>
          <div className={`rounded-circle bg-${val === 'published' ? 'success' : 'warning'}`} style={{ width: '6px', height: '6px' }}></div>
          <span className="fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.02em' }}>{val.toUpperCase()}</span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (val: any, post: Post) => (
        <div className="d-flex justify-content-end gap-2">
          <Link href={`/${adminPath}/blogs/edit/${post.id}`} className="btn btn-sm btn-white border shadow-sm p-2 rounded-3 hover-text-primary transition-all" title="Edit Post">
            <Edit size={16} />
          </Link>
          <button 
            className="btn btn-sm btn-white border shadow-sm p-2 rounded-3 text-danger hover-bg-danger hover-text-white transition-all" 
            title="Delete Post"
            onClick={() => handleDelete(post.id, post.title)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger rounded-4 border-0 shadow-sm">
          <h6 className="fw-bold mb-1">Error loading blogs</h6>
          <p className="small mb-0">{error}. Please check if the backend is running and you are logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 p-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.02em' }}>Blog Posts</h2>
          <p className="text-muted small mb-0">Manage your stories, news, and updates.</p>
        </div>
        <Link 
          href={`/${adminPath}/blogs/create`} 
          className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm fw-bold"
          style={{ padding: '10px 24px' }}
        >
          <Plus size={18} strokeWidth={2.5} /> Create New Post
        </Link>
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            Loading stories...
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={posts} 
            searchPlaceholder="Search by title or slug..."
            searchKeys={["title", "slug"]}
            defaultSortKey="title"
            defaultRowsPerPage={10}
          />
        )}
      </div>

      <style jsx>{`
        .x-small {
          font-size: 0.72rem;
        }
        .btn-white {
          background: white;
        }
        .btn-white:hover {
          background: #f8f9fa;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
