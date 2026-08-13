"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMetadata, setContent, setFieldGroups, resetEditor, setIsDirty } from "@/store/slices/editorSlice";
import { setVariables, resetSeo, saveSeo } from "@/store/slices/seoSlice";
import { pagesService } from "@/services/pages.service";
import { acfService } from "@/services/acf.service";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import TopbarActions from "@/components/admin/page-editor/TopbarActions";
import SidebarMeta from "@/components/admin/page-editor/SidebarMeta";
import SectionList from "@/components/admin/page-editor/SectionList";
import SeoPanel from "@/components/admin/seo/SeoPanel";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const dispatch = useAppDispatch();

  const { metadata, content } = useAppSelector((state) => state.editor);
  const { seoData } = useAppSelector((state) => state.seo);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync variables to SEO store
  useEffect(() => {
    dispatch(setVariables({
      title: metadata.seo_title || metadata.title || "",
      excerpt: metadata.description || "",
      site_name: "NextPress", 
      sep: "-",
    }));
  }, [metadata.title, metadata.seo_title, metadata.description, dispatch]);

  // Helper to get stringified content for SEO analysis
  const getStringifiedContent = () => {
    return JSON.stringify(content);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch Page Data
        const pageResponse = await pagesService.getPage(id);
        const pageData = pageResponse.data;

        // 2. Fetch Assigned ACF Groups (based on template/rules)
        const groupsData = await acfService.getGroupsForPage(id);
        
        // Filter active and sort by order_index
        const activeGroups = groupsData
          .filter((g: any) => g.status === "active")
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        // 3. Hydrate Store
        dispatch(setMetadata({
          id: pageData.id.toString(),
          title: pageData.title,
          seo_title: pageData.seo_title || pageData.title || "",
          slug: pageData.slug,
          description: pageData.description || "",
          status: pageData.status,
          featured_image_id: pageData.featured_image_id || undefined,
          featured_image_url: pageData.featured_image_url || undefined,
          template: pageData.template,
          seo_meta: typeof pageData.seo_meta === "string" 
            ? JSON.parse(pageData.seo_meta) 
            : (pageData.seo_meta || {})
        }));

        dispatch(setContent(typeof pageData.content_json === "string" 
          ? JSON.parse(pageData.content_json) 
          : (pageData.content_json || {})
        ));

        // Map ACFGroup to FieldGroup structure expected by the store
        const mappedGroups = activeGroups.map((g: any) => ({
          id: g.id.toString(),
          title: g.title,
          description: g.description,
          groupKey: g.group_key,
          fields: g.fields || [],
          page_id: g.page_id,
          order_index: g.order_index || 0,
          settings: typeof g.settings === 'string' ? JSON.parse(g.settings) : (g.settings || {})
        }));

        dispatch(setFieldGroups(mappedGroups));

      } catch (err: any) {
        console.error("Hydration Error:", err);
        setError("Failed to load page content. Please try again.");
        toast.error("Error loading page data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      dispatch(resetEditor());
      dispatch(resetSeo());
    };
  }, [id, dispatch]);

  const handleSave = async (status?: string) => {
    try {
      setIsSaving(true);
      
      const updateData = {
        title: metadata.title,
        seo_title: metadata.seo_title,
        slug: metadata.slug,
        description: metadata.description,
        status: (status || metadata.status) as any,
        featured_image_id: metadata.featured_image_id,
        seo_meta: JSON.stringify(metadata.seo_meta),
        content_json: JSON.stringify(content)
      };

      await pagesService.updatePage(id, updateData);

      if (seoData) {
        await dispatch(saveSeo({ entityType: "page", entityId: id, data: seoData })).unwrap();
      }
      
      if (status) {
        dispatch(setMetadata({ status: status as any }));
      }
      
      dispatch(setIsDirty(false));
      toast.success("Page updated successfully");
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.message || "Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mb-3 mx-auto" size={48} />
          <p className="text-muted fw-medium">Hydrating Page Editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-4">
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center max-w-md">
          <AlertCircle className="text-danger mx-auto mb-3" size={48} />
          <h4 className="fw-bold mb-2">Hydration Failed</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary rounded-pill px-4" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-editor-root min-vh-100 d-flex flex-column bg-light">
      {/* PHASE 1: TOPBAR */}
      <TopbarActions onSave={handleSave} isSaving={isSaving} />

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* PHASE 1: MAIN CONTENT AREA (70%) */}
        <main className="flex-grow-1 overflow-auto scrollbar-hidden">
          <div className="p-1 p-lg-5 d-flex flex-column gap-4" style={{ maxWidth: '1500px', margin: '0 auto' }}>
            
            {/* WORDPRESS-STYLE TITLE & DESCRIPTION */}
            <div className="bg-white rounded-4 border-0 shadow-sm p-4 p-lg-5 mb-2">
              <div className="mb-2">
                <label className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>SEO Title / Public Page Title</label>
                <input 
                  type="text" 
                  className="form-control border-0 px-0 fw-bold bg-transparent"
                  placeholder="Enter Page Title (Public)"
                  style={{ fontSize: '2.5rem', boxShadow: 'none' }}
                  value={metadata.seo_title}
                  onChange={(e) => setMetadata({ seo_title: e.target.value })}
                />
              </div>

              <div className="mb-0">
                <label className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>Page Summary / Meta Description</label>
                <textarea 
                  className="form-control border-0 px-0 bg-transparent text-muted"
                  placeholder="Enter a brief summary for this page..."
                  rows={2}
                  style={{ fontSize: '1.1rem', boxShadow: 'none', resize: 'none' }}
                  value={metadata.description || ""}
                  onChange={(e) => setMetadata({ description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <SectionList />
            
            <div className="mt-5 mb-5">
              <SeoPanel 
                entityType="page"
                entityId={id}
                slug={metadata.slug}
                title={metadata.seo_title || metadata.title}
                content={getStringifiedContent()}
                featuredImage={metadata.featured_image_url || undefined}
                manualExcerpt={metadata.description}
              />
            </div>
          </div>
        </main>

        {/* PHASE 1: SIDEBAR (30%) */}
        <aside className="h-100">
          <SidebarMeta />
        </aside>
      </div>

      <style jsx global>{`
        .page-editor-root {
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
