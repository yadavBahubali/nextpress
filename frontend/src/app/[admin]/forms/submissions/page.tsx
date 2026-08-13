"use client";
import Swal from 'sweetalert2';
import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaFilter, FaInbox, FaUser, FaRegCommentDots, FaRegEnvelope } from "react-icons/fa";
import { useParams, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchSubmissions, deleteSubmission } from "@/store/slices/formSlice";
import { fetchUsers } from "@/store/slices/userSlice";
import formsService, { FormSubmission, FormSubmissionNote } from "@/services/forms.service";
import toast from "react-hot-toast";

export default function SubmissionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const formIdFilter = searchParams?.get("formId");
  
  const dispatch = useAppDispatch();
  const { submissions, isLoading, error } = useAppSelector((state) => state.forms);
  const { users } = useAppSelector((state) => state.users);
  
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({title: 'Are you sure?', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, proceed!'});
    if (result.isConfirmed) {
      dispatch(deleteSubmission(id))
        .unwrap()
        .then(() => {
            toast.success("Lead deleted");
            if (selectedSubmission?.id === id) setSelectedSubmission(null);
        })
        .catch((err) => toast.error(err || "Failed to delete lead"));
    }
  };

  const refreshSelectedSubmission = async (id: number) => {
      try {
          const freshData = await formsService.getSubmissionById(id);
          setSelectedSubmission(freshData);
          dispatch(fetchSubmissions()); // Keep background list in sync
      } catch (e) {
          console.error("Failed to refresh submission", e);
      }
  };

  const handleUpdateStatus = async (id: number, status: FormSubmission['status']) => {
    try {
        await formsService.updateSubmissionStatus(id, status);
        toast.success(`Marked as ${status}`);
        refreshSelectedSubmission(id);
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  const handleUpdateSalesStatus = async (id: number, sales_status: string) => {
    try {
        await formsService.updateSalesStatus(id, sales_status);
        toast.success(`Sales status updated to ${sales_status.replace('_', ' ')}`);
        refreshSelectedSubmission(id);
    } catch (err) {
        toast.error("Failed to update sales status");
    }
  };

  const handleAssignUser = async (id: number, user_id: number | null) => {
    try {
        await formsService.assignSubmission(id, user_id);
        toast.success(user_id ? `Lead assigned successfully` : `Lead unassigned`);
        refreshSelectedSubmission(id);
    } catch (err) {
        toast.error("Failed to assign lead");
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubmission || !newNote.trim()) return;
    try {
        setIsSubmittingNote(true);
        await formsService.addNoteToSubmission(selectedSubmission.id, newNote.trim());
        setNewNote("");
        toast.success("Note added");
        refreshSelectedSubmission(selectedSubmission.id);
    } catch (err) {
        toast.error("Failed to add note");
    } finally {
        setIsSubmittingNote(false);
    }
  };

  const filteredSubmissions = submissions.filter((s: FormSubmission) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
        JSON.stringify(s.data).toLowerCase().includes(searchString) || 
        s.form_title?.toLowerCase().includes(searchString) ||
        s.assigned_user_name?.toLowerCase().includes(searchString);
    const matchesForm = formIdFilter ? s.form_id === parseInt(formIdFilter) : true;
    return matchesSearch && matchesForm;
  });

  const getSalesStatusColor = (status: string) => {
      switch(status) {
          case 'new': return 'primary';
          case 'attempted_contact': return 'warning';
          case 'meeting_scheduled': return 'info';
          case 'qualified': return 'success';
          case 'won': return 'success';
          case 'lost': return 'danger';
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

  return (
    <div className="p-4 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Lead Management (CRM)</h2>
          <p className="text-muted mb-0">Track inquiries, assign leads to sales reps, and log interactions.</p>
        </div>
      </div>

      <div className="row g-4 flex-grow-1" style={{ minHeight: 0 }}>
        {/* Left Column: Lead List */}
        <div className={selectedSubmission ? "col-lg-5 col-xl-4 h-100 d-flex flex-column" : "col-12 h-100 d-flex flex-column"}>
          <div className="card border-0 shadow-sm mb-3 flex-shrink-0">
            <div className="card-body p-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search leads by name, email, rep..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm flex-grow-1 overflow-auto scrollbar-custom">
            <div className="list-group list-group-flush rounded-3">
              {isLoading ? (
                <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading leads...
                </div>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((s: FormSubmission) => (
                  <div 
                    key={s.id} 
                    className={`list-group-item list-group-item-action cursor-pointer p-3 border-bottom ${selectedSubmission?.id === s.id ? 'bg-primary bg-opacity-10 border-primary' : ''}`}
                    onClick={() => {
                        setSelectedSubmission(s);
                        if (s.status === 'unread') handleUpdateStatus(s.id, 'read');
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span className="fw-bold d-block text-truncate" style={{ maxWidth: '200px' }}>
                                {s.data.name || s.data.email || 'Anonymous Lead'}
                            </span>
                            <span className="badge bg-light text-dark border small mt-1">{s.form_title}</span>
                        </div>
                        <span className={`badge bg-${getSalesStatusColor(s.sales_status || 'new')} bg-opacity-10 text-${getSalesStatusColor(s.sales_status || 'new')} text-capitalize`}>
                            {(s.sales_status || 'new').replace('_', ' ')}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted d-flex align-items-center gap-1">
                            <FaUser size={10}/> {s.assigned_user_name || 'Unassigned'}
                        </small>
                        <small className="text-muted">{new Date(s.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted">
                    <FaInbox size={48} className="opacity-25 mb-3 d-block mx-auto" />
                    No leads found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Lead Detail & CRM panel */}
        {selectedSubmission && (
            <div className="col-lg-7 col-xl-8 h-100 d-flex flex-column">
                <div className="card border-0 shadow-sm flex-grow-1 overflow-hidden d-flex flex-column">
                    {/* Header */}
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                        <div>
                            <h4 className="fw-bold mb-1">{selectedSubmission.data.name || 'Anonymous Lead'}</h4>
                            <div className="d-flex align-items-center gap-3 text-muted small">
                                <span>{selectedSubmission.form_title}</span>
                                <span>•</span>
                                <span>Submitted: {new Date(selectedSubmission.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(selectedSubmission.id)}>
                                <FaTrash />
                            </button>
                            <button className="btn-close ms-2" onClick={() => setSelectedSubmission(null)}></button>
                        </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="card-body p-0 overflow-auto scrollbar-custom d-flex flex-column flex-xl-row">
                        
                        {/* Left Info Pane */}
                        <div className="p-4 border-end border-light w-100 w-xl-50" style={{ flex: '1 1 50%' }}>
                            <div className="mb-4">
                                <label className="small text-muted text-uppercase fw-bold mb-2">Assign Representative</label>
                                <select 
                                    className="form-select bg-light"
                                    value={selectedSubmission.assigned_to || ''}
                                    onChange={(e) => handleAssignUser(selectedSubmission.id, e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">-- Unassigned --</option>
                                    {users.filter(u => [1,2,3].includes(u.role_id)).map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="small text-muted text-uppercase fw-bold mb-2">Sales Pipeline Status</label>
                                <select 
                                    className={`form-select text-${getSalesStatusColor(selectedSubmission.sales_status || 'new')} fw-semibold border-${getSalesStatusColor(selectedSubmission.sales_status || 'new')}`}
                                    value={selectedSubmission.sales_status || 'new'}
                                    onChange={(e) => handleUpdateSalesStatus(selectedSubmission.id, e.target.value)}
                                >
                                    <option value="new">New Lead</option>
                                    <option value="attempted_contact">Attempted Contact</option>
                                    <option value="meeting_scheduled">Meeting Scheduled</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="won">Closed: Won</option>
                                    <option value="lost">Closed: Lost</option>
                                </select>
                            </div>

                            <hr className="my-4" />

                            <label className="small text-muted text-uppercase fw-bold mb-3">Customer Information</label>
                            <div className="d-flex flex-column gap-3">
                                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="small text-muted d-block text-capitalize mb-1">{key.replace(/_/g, ' ')}</span>
                                        <div className="p-2 bg-light rounded-3 text-dark" style={{ wordBreak: 'break-word' }}>
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Activity Pane */}
                        <div className="p-4 bg-light w-100 w-xl-50 d-flex flex-column" style={{ flex: '1 1 50%' }}>
                            <label className="small text-muted text-uppercase fw-bold mb-3 d-flex align-items-center gap-2">
                                <FaRegCommentDots /> Activity & Internal Notes
                            </label>
                            
                            <div className="flex-grow-1 overflow-auto pe-2 mb-3 d-flex flex-column gap-3">
                                {!selectedSubmission.internal_notes || selectedSubmission.internal_notes.length === 0 ? (
                                    <div className="text-center py-5 text-muted small">
                                        No activity logged yet. Add a note below to start the timeline.
                                    </div>
                                ) : (
                                    selectedSubmission.internal_notes.map((note: FormSubmissionNote, idx: number) => (
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

                            <div className="mt-auto flex-shrink-0">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control bg-white" 
                                        placeholder="Log a call, meeting, or note..."
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                                    />
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim() || isSubmittingNote}
                                    >
                                        Add
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
