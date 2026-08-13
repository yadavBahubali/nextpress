import { create } from 'zustand';

interface SeoData {
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  is_noindex?: boolean;
  is_nofollow?: boolean;
  canonical_url?: string;
  redirect_url?: string;
  redirect_type?: number;
  schema_type?: string;
  schema_custom?: string;
  custom_schema?: string;
  sitemap_include?: boolean;
  sitemap_priority?: number;
  sitemap_changefreq?: string;
}

interface SeoVariables {
  title?: string;
  slug?: string;
  excerpt?: string;
  site_name?: string;
  sep?: string;
  site_domain?: string;
  [key: string]: any;
}

interface SeoStore {
  seoData: SeoData | null;
  variables: SeoVariables;
  isDirty: boolean;
  
  // Resolved values for previews
  resolvedOgTitle?: string;
  resolvedOgDescription?: string;
  resolvedTwitterTitle?: string;
  resolvedTwitterDescription?: string;
  resolvedSchema?: string;
  isSchemaAuto?: boolean;
  
  // Actions
  setSeoData: (data: SeoData | null) => void;
  updateSeo: (updates: Partial<SeoData>) => void;
  setVariables: (variables: Partial<SeoVariables>) => void;
  syncEditorContext: (...args: any[]) => void;
  setIsSchemaAuto: (isAuto: boolean) => void;
}

export const useSeoStore = create<SeoStore>((set) => ({
  seoData: null,
  variables: {
    site_name: 'NextPress',
    sep: '-',
  },
  isDirty: false,
  resolvedOgTitle: '',
  resolvedOgDescription: '',
  resolvedTwitterTitle: '',
  resolvedTwitterDescription: '',
  resolvedSchema: '{}',
  isSchemaAuto: true,

  setSeoData: (seoData) => set({ seoData, isDirty: false }),
  
  updateSeo: (updates) => set((state) => ({
    seoData: state.seoData ? { ...state.seoData, ...updates } : (updates as SeoData),
    isDirty: true
  })),

  setVariables: (variables) => set((state) => ({
    variables: { ...state.variables, ...variables }
  })),

  syncEditorContext: (...args: any[]) => {
    // This would normally run analysis on the content
    // For now it's a placeholder to satisfy the interface
    console.log('Syncing editor context to SEO store', args);
  },

  setIsSchemaAuto: (isSchemaAuto) => set({ isSchemaAuto })
}));
