import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import careersService, { Job, JobApplication } from '@/services/careers.service';

interface CareersState {
  jobs: Job[];
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CareersState = {
  jobs: [],
  applications: [],
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk('careers/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    return await careersService.getAllJobs();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
  }
});

export const fetchApplications = createAsyncThunk('careers/fetchApplications', async (jobId: number | undefined, { rejectWithValue }) => {
  try {
    return await careersService.getAllApplications(jobId);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
  }
});

export const deleteJob = createAsyncThunk('careers/deleteJob', async (id: number, { rejectWithValue }) => {
  try {
    await careersService.deleteJob(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
  }
});

export const deleteApplication = createAsyncThunk('careers/deleteApplication', async (id: number, { rejectWithValue }) => {
  try {
    await careersService.deleteApplication(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete application');
  }
});

const careerSlice = createSlice({
  name: 'careers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Applications
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j.id !== action.payload);
      })
      // Delete Application
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter((a) => a.id !== action.payload);
      });
  },
});

export default careerSlice.reducer;
