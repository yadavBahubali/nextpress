import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mediaService } from '@/services/media.service';

interface MediaState {
  items: any[];
  isLoading: boolean;
  isUploading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: MediaState = {
  items: [],
  isLoading: false,
  isUploading: false,
  isSaving: false,
  error: null,
};

export const fetchMedia = createAsyncThunk(
  'media/fetchMedia',
  async (params: { search?: string, type?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await mediaService.getAll(params);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch media');
    }
  }
);

export const uploadMedia = createAsyncThunk(
  'media/upload',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      const response = await mediaService.upload(formData);
      dispatch(fetchMedia());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload media');
    }
  }
);

export const updateMedia = createAsyncThunk(
  'media/update',
  async ({ id, data }: { id: number, data: any }, { dispatch, rejectWithValue }) => {
    try {
      const response = await mediaService.update(id, data);
      dispatch(fetchMedia());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update media');
    }
  }
);

export const deleteMedia = createAsyncThunk(
  'media/deleteMedia',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await mediaService.delete(id);
      dispatch(fetchMedia());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media');
    }
  }
);


const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMedia.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload
      .addCase(uploadMedia.pending, (state) => {
        state.isUploading = true;
      })
      .addCase(uploadMedia.fulfilled, (state) => {
        state.isUploading = false;
        state.error = null;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateMedia.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateMedia.fulfilled, (state) => {
        state.isSaving = false;
        state.error = null;
      })
      .addCase(updateMedia.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export default mediaSlice.reducer;
