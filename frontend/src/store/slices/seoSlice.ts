import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { seoService, SeoMeta } from '@/services/seo.service';
import { resolveTitle, resolveDescription, ResolvedSeoValue } from "@/utils/seoResolver";
import { analyzeSeo } from "@/utils/seoAnalyzer";
import { generateJsonLd } from "@/utils/schemaGenerator";

export interface SeoCheck {
  id: string;
  label: string;
  status: 'good' | 'warning' | 'error';
  message: string;
  score: number;
}

interface SeoVariables {
  title: string;
  excerpt: string;
  author: string;
  site_name: string;
  sep: string;
  featured_image?: string;
  site_domain?: string;
  slug?: string;
  [key: string]: string | undefined;
}

interface SeoState {
  seoData: SeoMeta | null;
  variables: SeoVariables;
  activeTab: 'general' | 'analysis' | 'social' | 'schema' | 'advanced' | 'redirects' | 'sitemap';
  score: number;
  setupScore: number;
  checks: SeoCheck[];
  resolvedTitle: ResolvedSeoValue | null;
  resolvedDescription: ResolvedSeoValue | null;
  resolvedOgTitle: string;
  resolvedOgDescription: string;
  resolvedTwitterTitle: string;
  resolvedTwitterDescription: string;
  resolvedSchema: string;
  previewDevice: 'desktop' | 'mobile';
  isTitleAuto: boolean;
  isDescriptionAuto: boolean;
  isSchemaAuto: boolean;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;
}

const initialState: SeoState = {
  seoData: null,
  variables: {
    title: '',
    excerpt: '',
    author: '',
    site_name: 'NextPress',
    sep: '-',
  },
  activeTab: 'general',
  score: 0,
  setupScore: 0,
  checks: [],
  resolvedTitle: null,
  resolvedDescription: null,
  resolvedOgTitle: '',
  resolvedOgDescription: '',
  resolvedTwitterTitle: '',
  resolvedTwitterDescription: '',
  resolvedSchema: '',
  previewDevice: 'desktop',
  isTitleAuto: true,
  isDescriptionAuto: true,
  isSchemaAuto: true,
  isLoading: false,
  isDirty: false,
  error: null,
};

// HELPER for resolution
const resolveAll = (state: SeoState) => {
  if (!state.seoData) return;

  state.resolvedTitle = resolveTitle(
    state.isTitleAuto ? null : state.seoData.meta_title, 
    state.variables.title, 
    null, 
    state.variables
  );
  state.resolvedDescription = resolveDescription(
    state.isDescriptionAuto ? null : state.seoData.meta_description, 
    state.variables.excerpt, 
    null, 
    state.variables
  );

  // Social resolution logic
  state.resolvedOgTitle = state.seoData.og_title || state.resolvedTitle?.value || '';
  state.resolvedOgDescription = state.seoData.og_description || state.resolvedDescription?.value || '';
  
  state.resolvedTwitterTitle = state.seoData.twitter_title || state.resolvedOgTitle || '';
  state.resolvedTwitterDescription = state.seoData.twitter_description || state.resolvedOgDescription || '';

  // Schema resolution logic
  if (state.isSchemaAuto) {
    const generated = generateJsonLd({
      type: (state.seoData.schema_type || 'Article') as any,
      variables: state.variables,
      title: state.resolvedTitle?.value || '',
      description: state.resolvedDescription?.value || '',
      url: state.variables.slug || '',
      image: state.variables.featured_image
    });
    state.resolvedSchema = JSON.stringify(generated, null, 2);
  } else {
    state.resolvedSchema = state.seoData.schema_custom || '';
  }
};

export const fetchSeo = createAsyncThunk(
  'seo/fetch',
  async ({ entityType, entityId }: { entityType: string; entityId: number | string | null }, { rejectWithValue }) => {
    try {
      const response = await seoService.getSeo(entityType, entityId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SEO data');
    }
  }
);

export const saveSeo = createAsyncThunk(
  'seo/save',
  async ({ entityType, entityId, data }: { entityType: string; entityId: number | string | null; data: Partial<SeoMeta> }, { rejectWithValue }) => {
    try {
      const response = await seoService.upsertSeo(entityType, entityId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save SEO data');
    }
  }
);

const seoSlice = createSlice({
  name: 'seo',
  initialState,
  reducers: {
    setVariables: (state, action: PayloadAction<Partial<SeoVariables>>) => {
      state.variables = { ...state.variables, ...action.payload };
      resolveAll(state);
    },
    setActiveTab: (state, action: PayloadAction<SeoState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setPreviewDevice: (state, action: PayloadAction<'desktop' | 'mobile'>) => {
      state.previewDevice = action.payload;
    },
    setIsTitleAuto: (state, action: PayloadAction<boolean>) => {
      state.isTitleAuto = action.payload;
      resolveAll(state);
    },
    setIsDescriptionAuto: (state, action: PayloadAction<boolean>) => {
      state.isDescriptionAuto = action.payload;
      resolveAll(state);
    },
    setIsSchemaAuto: (state, action: PayloadAction<boolean>) => {
      state.isSchemaAuto = action.payload;
      resolveAll(state);
    },
    updateSeoData: (state, action: PayloadAction<Partial<SeoMeta>>) => {
      if (state.seoData) {
        state.seoData = { ...state.seoData, ...action.payload };
        state.isDirty = true;
        resolveAll(state);
      }
    },
    runAnalysis: (state, action: PayloadAction<{ content: string; slug: string; title: string; excerpt?: string }>) => {
      if (state.seoData) {
        const result = analyzeSeo(
          state.seoData.focus_keyword || '',
          state.resolvedTitle?.value || '',
          state.resolvedDescription?.value || '',
          action.payload.slug,
          action.payload.content
        );
        state.score = result.score;
        state.checks = result.checks;
        
        // Calculate setup score
        let setup = 0;
        if (state.seoData.focus_keyword) setup += 25;
        if (state.seoData.meta_title) setup += 25;
        if (state.seoData.meta_description) setup += 25;
        if (state.seoData.og_image) setup += 25;
        state.setupScore = setup;
      }
    },
    resetSeo: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSeo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seoData = action.payload || {
          entity_type: '',
          entity_id: null,
          meta_title: '',
          meta_description: '',
          focus_keyword: '',
        };
        
        // Determine if they are auto based on whether they match page defaults or are empty
        if (state.seoData) {
          state.isTitleAuto = !state.seoData.meta_title;
          state.isDescriptionAuto = !state.seoData.meta_description;
          state.isSchemaAuto = !state.seoData.schema_custom;
        }
        
        state.isDirty = false;
        state.error = null;
        
        resolveAll(state);
      })
      .addCase(fetchSeo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveSeo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveSeo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seoData = action.payload;
        state.isDirty = false;
        state.error = null;
      })
      .addCase(saveSeo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setVariables, setActiveTab, setPreviewDevice, 
  setIsTitleAuto, setIsDescriptionAuto, setIsSchemaAuto,
  updateSeoData, runAnalysis, resetSeo 
} = seoSlice.actions;
export default seoSlice.reducer;
