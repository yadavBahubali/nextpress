"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaUserTie, FaLinkedin, FaFileDownload, FaRegCommentDots, FaBriefcase, FaEnvelope, FaPhone } from "react-icons/fa";
import { useParams, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchApplications, deleteApplication } from "@/store/slices/careerSlice";
import careersService, { JobApplication, JobApplicationNote } from "@/services/careers.service";
import toast from "react-hot-toast";

export default function ApplicantsATS() {
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const jobIdFilter = searchParams?.get("jobId");
  
  const dispatch = useAppDispatch();
  const { applications, isLoading, error } = useAppSelector((state) => state.careers);
  
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    dispatch(fetchApplications(jobIdFilter ? parseInt(jobIdFilter) : undefined));
  }, [dispatch, jobIdFilter]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteApplication(id))
        .unwrap()
        .then(() => {
            toast.success("Applicant deleted");
            if (selectedApp?.id === id) setSelectedApp(null);
        })
        .catch((err) => toast.error(err || "Failed to delete applicant"));
    }
  };

  const refreshSelectedApp = async (id: number) => {
      try {
          const freshData = await careersService.getApplicationById(id);
          setSelectedApp(freshData);
          dispatch(fetchApplications(jobIdFilter ? parseInt(jobIdFilter) : undefined));
      } catch (e) {
          console.error("Failed to refresh application", e);
      }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
        await careersService.updateApplicationStatus(id, status);
        toast.success(`Applicant moved to ${status.replace('_', ' ')}`);
        refreshSelectedApp(id);
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!selectedApp || !newNote.trim()) return;
    try {
        setIsSubmittingNote(true);
        await careersService.addApplicationNote(selectedApp.id, newNote.trim());
        setNewNote("");
        toast.success("Note added");
        refreshSelectedApp(selectedApp.id);
    } catch (err) {
        toast.error("Failed to add note");
    } finally {
        setIsSubmittingNote(false);
    }
  };

  const filteredApps = applications.filter((app: JobApplication) => {
    const searchString = searchTerm.toLowerCase();
    return (
        app.name.toLowerCase().includes(searchString) || 
        app.email.toLowerCase().includes(searchString) ||
        (app.job_title && app.job_title.toLowerCase().includes(searchString))
    );
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'new': return 'primary';
          case 'reviewed': return 'info';
          case 'interviewing': return 'warning';
          case 'offered': return 'success';
          case 'hired': return 'success';
          case 'rejected': return 'danger';
          default: return 'secondary';
      }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  return (
    <div className="p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-shrink-0">
        <div>
          <h2 className="fw-bold">Applicant Tracking System (ATS)</h2>
          <p className="text-muted mb-0">Review candidates and manage the hiring pipeline.</p>
        </div>
      </div>

      <div className="row g-4 flex-grow-1" style={{ minHeight: 0 }}>
        {/* Left Column: Applicant List */}
        <div className={selectedApp ? "col-lg-5 col-xl-4 h-100 d-flex flex-column" : "col-12 h-100 d-flex flex-column"}>
          <div className="card border-0 shadow-sm mb-3 flex-shrink-0 rounded-4">
            <div className="card-body p-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search applicants by name, email, or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm flex-grow-1 overflow-auto scrollbar-custom rounded-4">
            <div className="list-group list-group-flush">
              {isLoading ? (
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading applicants...
                </div>
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app: JobApplication) => (
                  <div 
                    key={app.id} 
                    className={`list-group-item list-group-item-action cursor-pointer p-3 border-bottom ${selectedApp?.id === app.id ? 'bg-primary bg-opacity-10 border-primary' : ''}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span className="fw-bold d-block text-truncate text-dark" style={{ maxWidth: '200px' }}>
                                {app.name}
                            </span>
                            <span className="badge bg-light text-dark border small mt-1 text-truncate" style={{ maxWidth: '180px' }}>{app.job_title}</span>
                        </div>
                        <span className={`badge bg-${getStatusColor(app.status)} bg-opacity-10 text-${getStatusColor(app.status)} text-capitalize px-2 py-1`}>
                            {app.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted text-truncate" style={{ maxWidth: '150px' }}>{app.email}</small>
                        <small className="text-muted">{new Date(app.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                    <FaUserTie size={48} className="opacity-25 mb-3 d-block mx-auto" />
                    No applicants found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Applicant Detail */}
        {selectedApp && (
            <div className="col-lg-7 col-xl-8 h-100 d-flex flex-column">
                <div className="card border-0 shadow-sm flex-grow-1 overflow-hidden d-flex flex-column rounded-4">
                    {/* Header */}
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                <span className="fs-4 fw-bold">{selectedApp.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <h4 className="fw-bold mb-1">{selectedApp.name}</h4>
                                <div className="d-flex align-items-center gap-3 text-muted small">
                                    <span className="d-flex align-items-center gap-1"><FaBriefcase /> {selectedApp.job_title}</span>
                                    <span>•</span>
                                    <span>Applied: {new Date(selectedApp.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(selectedApp.id)}>
                                <FaTrash />
                            </button>
                            <button className="btn-close ms-2" onClick={() => setSelectedApp(null)}></button>
                        </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="card-body p-0 overflow-auto scrollbar-custom d-flex flex-column flex-xl-row">
                        
                        {/* Left Info Pane */}
                        <div className="p-4 border-end border-light w-100 w-xl-50 bg-white" style={{ flex: '1 1 50%' }}>
                            
                            <div className="mb-4">
                                <label className="small text-muted text-uppercase fw-bold mb-2">Hiring Pipeline Stage</label>
                                <select 
                                    className={`form-select text-${getStatusColor(selectedApp.status)} fw-semibold border-${getStatusColor(selectedApp.status)}`}
                                    value={selectedApp.status}
                                    onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value)}
                                    style={{ backgroundColor: `var(--bs-${getStatusColor(selectedApp.status)}-bg-subtle)` }}
                                >
                                    <option value="new">New Applicant</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offered">Offer Extended</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <hr className="my-4 border-light" />

                            <label className="small text-muted text-uppercase fw-bold mb-3">Contact Information</label>
                            
                            <div className="d-flex flex-column gap-3 mb-4">
                                <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                                    <div className="text-primary"><FaEnvelope size={18} /></div>
                                    <a href={`mailto:${selectedApp.email}`} className="text-dark text-decoration-none">{selectedApp.email}</a>
                                </div>
                                
                                {selectedApp.phone && (
                                    <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                                        <div className="text-success"><FaPhone size={18} /></div>
                                        <a href={`tel:${selectedApp.phone}`} className="text-dark text-decoration-none">{selectedApp.phone}</a>
                                    </div>
                                )}
                                
                                {selectedApp.linkedin_url && (
                                    <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                                        <div className="text-primary" style={{ color: '#0077b5' }}><FaLinkedin size={18} /></div>
                                        <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none text-truncate">
                                            {selectedApp.linkedin_url}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <label className="small text-muted text-uppercase fw-bold mb-2 mt-4">Resume / CV</label>
                            <a 
                                href={`${backendUrl}${selectedApp.resume_path}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-3 border-dashed"
                                style={{ borderStyle: 'dashed', borderWidth: '2px' }}
                            >
                                <FaFileDownload size={20} />
                                View Resume Document
                            </a>
                        </div>

                        {/* Right Activity Pane */}
                        <div className="p-4 bg-light w-100 w-xl-50 d-flex flex-column" style={{ flex: '1 1 50%' }}>
                            <label className="small text-muted text-uppercase fw-bold mb-3 d-flex align-items-center gap-2">
                                <FaRegCommentDots /> Interview Notes
                            </label>
                            
                            <div className="flex-grow-1 overflow-auto pe-2 mb-3 d-flex flex-column gap-3">
                                {!selectedApp.internal_notes || selectedApp.internal_notes.length === 0 ? (
                                    <div className="text-center py-5 text-muted small">
                                        No interview notes yet. Add your evaluation below.
                                    </div>
                                ) : (
                                    selectedApp.internal_notes.map((note: JobApplicationNote, idx: number) => (
                                        <div key={idx} className="bg-white p-3 rounded-3 shadow-sm border border-light">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <strong className="small text-primary">{note.user_name}</strong>
                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {new Date(note.timestamp).toLocaleString()}
                                                </small>
                                            </div>
                                            <p className="mb-0 small text-dark">{note.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-auto flex-shrink-0 bg-white p-2 rounded-3 border">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control border-0 shadow-none" 
                                        placeholder="Add interview feedback..."
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                                    />
                                    <button 
                                        className="btn btn-primary rounded-3 px-4"
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim() || isSubmittingNote}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}
      </div>
      
      <style jsx>{`
        .cursor-pointer { cursor: pointer; }
        .scrollbar-custom::-webkit-scrollbar { width: 6px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
