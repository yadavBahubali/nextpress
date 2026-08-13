import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Metadata {
  id?: string;
  title: string;
  seo_title: string;
  slug: string;
  description: string;
  status: string;
  featured_image_id?: number;
  featured_image_url?: string;
  template?: string;
  seo_meta: any;
}

interface EditorState {
  fieldGroups: any[];
  content: Record<string, any>;
  metadata: Metadata;
  isLoading: boolean;
  isDirty: boolean;
}

const initialState: EditorState = {
  fieldGroups: [],
  content: {},
  metadata: {
    title: '',
    seo_title: '',
    slug: '',
    description: '',
    status: 'draft',
    seo_meta: {}
  },
  isLoading: false,
  isDirty: false,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setFieldGroups: (state, action: PayloadAction<any[]>) => {
      state.fieldGroups = action.payload;
    },
    setContent: (state, action: PayloadAction<Record<string, any>>) => {
      state.content = action.payload;
      state.isDirty = false;
    },
    setMetadata: (state, action: PayloadAction<Partial<Metadata>>) => {
      state.metadata = { ...state.metadata, ...action.payload };
      state.isDirty = true;
    },
    setIsDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    updateContent: (state, action: PayloadAction<{ path: string; value: any }>) => {
      const { path, value } = action.payload;
      const parts = path.split('.');
      
      let current = state.content;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      state.isDirty = true;
    },
    resetEditor: (state) => {
      return initialState;
    },
  },
});

export const { setFieldGroups, setContent, setMetadata, setIsDirty, updateContent, resetEditor } = editorSlice.actions;
export default editorSlice.reducer;
