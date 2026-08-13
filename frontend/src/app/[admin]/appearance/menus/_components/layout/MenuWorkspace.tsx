"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { loadMenu, resetMenu } from '@/store/slices/menuBuilderSlice';
import Topbar from './Topbar';
import SourceSidebar from './SourceSidebar';
import InspectorSidebar from './InspectorSidebar';
import BuilderCanvas from '../builder/BuilderCanvas';
import { Loader2 } from 'lucide-react';

export default function MenuWorkspace({ menuId }: { menuId?: number }) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.menuBuilder);

  useEffect(() => {
    if (menuId) {
      dispatch(loadMenu(menuId));
    } else {
      dispatch(resetMenu());
    }
    return () => {
      dispatch(resetMenu());
    };
  }, [menuId, dispatch]);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-3" size={48} />
          <h5 className="fw-bold">Loading Menu Builder...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-workspace-root d-flex flex-column bg-light min-vh-100 overflow-hidden">
      <Topbar />
      
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* LEFT PANEL: Source Library */}
        <aside className="border-end bg-white d-none d-xl-flex flex-column h-100" style={{ width: '320px', minWidth: '320px' }}>
          <SourceSidebar />
        </aside>

        {/* CENTER PANEL: Canvas */}
        <main className="flex-grow-1 d-flex flex-column h-100 overflow-hidden position-relative" style={{ backgroundColor: '#f1f5f9' }}>
          <BuilderCanvas />
        </main>

        {/* RIGHT PANEL: Inspector */}
        <aside className="border-start bg-white d-none d-lg-flex flex-column h-100 shadow-sm z-1" style={{ width: '350px', minWidth: '350px' }}>
          <InspectorSidebar />
        </aside>
      </div>

      <style jsx global>{`
        .menu-workspace-root {
          height: 100vh;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
