import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pagesService, Page } from '@/services/pages.service';

interface PagesState {
  pages: Page[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PagesState = {
  pages: [],
  isLoading: false,
  error: null,
};

export const fetchPages = createAsyncThunk(
  'pages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pagesService.getPages();
      if (response?.data) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch pages');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pages');
    }
  }
);

export const deletePage = createAsyncThunk(
  'pages/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await pagesService.deletePage(id);
      dispatch(fetchPages());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete page');
    }
  }
);

export const createPage = createAsyncThunk(
  'pages/create',
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      const response = await pagesService.createPage(data);
      dispatch(fetchPages());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create page');
    }
  }
);

const pageSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default pageSlice.reducer;
