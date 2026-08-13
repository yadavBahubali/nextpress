import { create } from 'zustand';

interface PageMetadata {
  id?: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  description: string;
  seo_title: string;
  featured_image_id?: number;
  featured_image_url?: string;
  template?: string;
  seo_meta: any;
}

interface PageEditorState {
  metadata: PageMetadata;
  content: any;
  fieldGroups: any[];
  isDirty: boolean;
  isLoading: boolean;
  
  // Actions
  setMetadata: (metadata: Partial<PageMetadata>) => void;
  setContent: (content: any) => void;
  setFieldGroups: (groups: any[]) => void;
  setIsDirty: (isDirty: boolean) => void;
  resetStore: () => void;
}

const initialMetadata: PageMetadata = {
  title: '',
  slug: '',
  status: 'draft',
  description: '',
  seo_title: '',
  seo_meta: {},
};

export const usePageEditorStore = create<PageEditorState>((set) => ({
  metadata: initialMetadata,
  content: {},
  fieldGroups: [],
  isDirty: false,
  isLoading: false,

  setMetadata: (metadata) => set((state) => ({
    metadata: { ...state.metadata, ...metadata },
    isDirty: true
  })),

  setContent: (content) => set({ content, isDirty: true }),

  setFieldGroups: (fieldGroups) => set({ fieldGroups }),

  setIsDirty: (isDirty) => set({ isDirty }),

  resetStore: () => set({
    metadata: initialMetadata,
    content: {},
    fieldGroups: [],
    isDirty: false,
    isLoading: false,
  }),
}));
