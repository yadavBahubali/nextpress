"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaSave, FaArrowLeft, FaCog } from "react-icons/fa";
import Link from "next/link";
import formsService, { Form } from "@/services/forms.service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import FormFieldsBuilder, { validateFormFields } from "@/components/admin/forms/FormFieldsBuilder";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const adminPath = (params?.admin as string) || "admin";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Form>>({
    title: "",
    slug: "",
    description: "",
    status: "active",
    fields: [],
    settings: {
      success_message: "Thank you for your submission!",
      admin_email: "",
      submit_button_text: "Submit",
    }
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        const data = await formsService.getFormById(parseInt(id));
        setFormData(data);
      } catch (err) {
        toast.error("Failed to load form data");
        router.push(`/${adminPath}/forms`);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id, adminPath, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!formData.title || !formData.slug) {
        toast.error("Title and Slug are required");
        return;
      }
      const fieldsError = validateFormFields(formData.fields || []);
      if (fieldsError) {
        toast.error(fieldsError);
        return;
      }
      await formsService.updateForm(parseInt(id), formData);
      toast.success("Form updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update form");
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
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href={`/${adminPath}/forms`} className="btn btn-light border rounded-circle p-2">
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="fw-bold mb-0">Edit Form: {formData.title}</h2>
            <p className="text-muted mb-0">Customize your form fields and settings.</p>
          </div>
        </div>
        <div className="d-flex gap-2">
           <button 
            className="btn btn-primary d-flex align-items-center gap-2 px-4"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FaSave />}
            Save Form
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Editor */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-4">Form Fields</h5>

            <FormFieldsBuilder
              fields={formData.fields || []}
              onChange={(fields) => setFormData(prev => ({ ...prev, fields }))}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-4">Form Settings</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Form Title</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Slug (URL Key)</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><FaCog className="me-2" /> Configurations</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Admin Email Notification</label>
              <input 
                type="email" 
                className="form-control"
                placeholder="admin@example.com"
                value={formData.settings?.admin_email}
                onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, admin_email: e.target.value } 
                }))}
              />
              <small className="text-muted">Submissions will be sent here.</small>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Notification Email Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder={`New Submission: ${formData.title || "Form Title"}`}
                value={formData.settings?.email_subject || ""}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, email_subject: e.target.value }
                }))}
              />
              <div className="form-text">Leave blank to use the default subject line.</div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Success Message</label>
              <textarea 
                className="form-control"
                rows={3}
                value={formData.settings?.success_message}
                onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, success_message: e.target.value } 
                }))}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Submit Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.settings?.submit_button_text}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, submit_button_text: e.target.value }
                }))}
              />
            </div>

            <div className="mb-0">
              <label className="form-label small fw-bold">Redirect URL (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="/thank-you"
                value={formData.settings?.redirect_url || ""}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, redirect_url: e.target.value }
                }))}
              />
              <div className="form-text">If set, visitors are sent here after submitting instead of seeing the success message.</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-move { cursor: move; }
        .border-dashed { border-style: dashed !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
