import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { acfService } from '@/services/acf.service';

interface AcfState {
  fieldGroups: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AcfState = {
  fieldGroups: [],
  isLoading: false,
  error: null,
};

export const fetchFieldGroups = createAsyncThunk(
  'acf/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await acfService.getGroups();
      return response.groups || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch field groups');
    }
  }
);

export const deleteFieldGroup = createAsyncThunk(
  'acf/deleteGroup',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await acfService.deleteGroup(id);
      dispatch(fetchFieldGroups());
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete field group');
    }
  }
);

const acfSlice = createSlice({
  name: 'acf',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFieldGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFieldGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fieldGroups = action.payload;
      })
      .addCase(fetchFieldGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default acfSlice.reducer;
