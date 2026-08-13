"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { saveMenu } from '@/store/slices/menuBuilderSlice';
import { adminPath } from '@/utils/BaseUrl';
import { ArrowLeft, Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Topbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { menuName, isDirty, isSaving, activeMenuId } = useAppSelector((state) => state.menuBuilder);

  const handleSave = async () => {
    try {
      await dispatch(saveMenu()).unwrap();
      toast.success("Menu saved successfully");
    } catch (e: any) {
      toast.error(e || "Failed to save menu");
    }
  };

  return (
    <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm z-2 position-relative">
      <div className="d-flex align-items-center gap-3">
        <button 
          onClick={() => router.push(`/${adminPath}/appearance/menus`)} 
          className="btn btn-sm btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            {menuName || 'Untitled Menu'}
            {isDirty && <span className="badge bg-warning-subtle text-warning x-small rounded-pill">Unsaved Changes</span>}
          </h5>
          <span className="x-small text-muted text-uppercase fw-bold">
            {activeMenuId ? `Menu ID: ${activeMenuId}` : 'New Menu Draft'}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {isDirty && (
          <span className="text-muted x-small d-flex align-items-center gap-1 me-3">
            <RefreshCw size={12} className="animate-spin-slow" /> Pending sync
          </span>
        )}
        <button 
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Menu Structure
        </button>
      </div>
      <style jsx>{`
        .x-small { font-size: 0.7rem; letter-spacing: 0.05em; }
        .animate-spin-slow { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
}
