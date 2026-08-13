import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import formsService, { Form, FormSubmission } from '@/services/forms.service';

interface FormState {
  forms: Form[];
  submissions: FormSubmission[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FormState = {
  forms: [],
  submissions: [],
  isLoading: false,
  error: null,
};

export const fetchForms = createAsyncThunk('forms/fetchForms', async (_, { rejectWithValue }) => {
  try {
    return await formsService.getAllForms();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch forms');
  }
});

export const fetchSubmissions = createAsyncThunk('forms/fetchSubmissions', async (_, { rejectWithValue }) => {
  try {
    return await formsService.getAllSubmissions();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
  }
});

export const deleteForm = createAsyncThunk('forms/deleteForm', async (id: number, { rejectWithValue }) => {
  try {
    await formsService.deleteForm(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete form');
  }
});

export const deleteSubmission = createAsyncThunk('forms/deleteSubmission', async (id: number, { rejectWithValue }) => {
  try {
    await formsService.deleteSubmission(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete submission');
  }
});

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Forms
      .addCase(fetchForms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Form
      .addCase(deleteForm.fulfilled, (state, action) => {
        state.forms = state.forms.filter((f) => f.id !== action.payload);
      })
      // Delete Submission
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.submissions = state.submissions.filter((s) => s.id !== action.payload);
      });
  },
});

export default formSlice.reducer;
