"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import Link from "next/link";
import careersService, { Job } from "@/services/careers.service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import WysiwygField from "@/components/admin/page-editor/fields/WysiwygField";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    slug: "",
    department: "",
    location: "",
    type: "full-time",
    status: "draft",
    description: "",
    requirements: "",
    attachment_path: ""
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const job = await careersService.getJobById(parseInt(id));
        setFormData(job);
      } catch (err) {
        toast.error("Failed to load job data");
        router.push(`/${adminPath}/hr/jobs`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      setTimeout(fetchJob, 100);
    }
  }, [id, adminPath, router]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const currentDesc = formData.description;
      const currentReqs = formData.requirements;
      
      if (!formData.title || !formData.slug || !currentDesc || currentDesc === '<p></p>') {
        toast.error("Title, Slug, and Description are required");
        return;
      }

      const submissionData = new FormData();
      submissionData.append('title', formData.title || '');
      submissionData.append('slug', formData.slug || '');
      submissionData.append('description', currentDesc || '');
      if (currentReqs) submissionData.append('requirements', currentReqs);
      if (formData.department) submissionData.append('department', formData.department);
      if (formData.location) submissionData.append('location', formData.location);
      if (formData.type) submissionData.append('type', formData.type);
      if (formData.status) submissionData.append('status', formData.status);
      
      if (attachment) {
        submissionData.append('attachment', attachment);
      }
      
      await careersService.updateJob(parseInt(id), submissionData);
      
      toast.success("Job updated successfully!");
      router.push(`/${adminPath}/hr/jobs`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href={`/${adminPath}/hr/jobs`} className="btn btn-light border rounded-circle p-2">
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="fw-bold mb-0">Edit Job: {formData.title}</h2>
            <p className="text-muted mb-0">Update career opportunity details.</p>
          </div>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FaSave />}
          Save Changes
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
            <h5 className="fw-bold mb-4">Job Details</h5>
            
            <div className="mb-4">
              <label className="form-label fw-semibold">Job Title <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                value={formData.title} 
                onChange={handleTitleChange} 
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
              <WysiwygField 
                field={{ type: "wysiwyg", label: "Description", name: "description", id: "description", key: "description" }}
                value={formData.description || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Requirements & Qualifications</label>
              <WysiwygField 
                field={{ type: "wysiwyg", label: "Requirements", name: "requirements", id: "requirements", key: "requirements" }}
                value={formData.requirements || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, requirements: val }))}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-4">Settings</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-semibold">URL Slug <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.slug} 
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} 
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Status</label>
              <select 
                className="form-select" 
                value={formData.status} 
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-4">Attributes</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-semibold">Department</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.department || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} 
                placeholder="e.g. Engineering"
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Location</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.location || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} 
                placeholder="e.g. Remote, India"
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Job Type</label>
              <select 
                className="form-select" 
                value={formData.type} 
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="mb-0">
              <label className="form-label small fw-semibold">Attachment (PDF/DOC/IMG)</label>
              {formData.attachment_path && (
                <div className="mb-2">
                  <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${formData.attachment_path}`} target="_blank" rel="noopener noreferrer" className="badge bg-primary bg-opacity-10 text-primary text-decoration-none">
                    View Current Attachment
                  </a>
                </div>
              )}
              <input 
                type="file" 
                className="form-control form-control-sm"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
              />
              <small className="text-muted d-block mt-1">Upload to replace the current attachment.</small>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}
