import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService } from '@/services/settings.service';

interface SettingsState {
  settings: Record<string, any>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  isLoading: false,
  isSaving: false,
  error: null,
};

export const fetchSetting = createAsyncThunk(
  'settings/fetchSetting',
  async (key: string, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSetting(key);
      if (response.success) {
        return { key, value: response.data };
      }
      return rejectWithValue('Failed to fetch setting');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch setting');
    }
  }
);

export const fetchSettingsGroup = createAsyncThunk(
  'settings/fetchGroup',
  async (keys: string[], { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        keys.map(key => settingsService.getSetting(key))
      );
      
      const settings: Record<string, any> = {};
      results.forEach((res, index) => {
        if (res.success) {
          settings[keys[index]] = res.data;
        }
      });
      return settings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const saveSettingsGroup = createAsyncThunk(
  'settings/saveGroup',
  async ({ data, group }: { data: Record<string, any>, group: string }, { dispatch, rejectWithValue }) => {
    try {
      const promises = Object.entries(data).map(([key, value]) => 
        settingsService.saveSetting(key, value, group)
      );
      await Promise.all(promises);
      dispatch(fetchSettingsGroup(Object.keys(data)));
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Single Setting
      .addCase(fetchSetting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings[action.payload.key] = action.payload.value;
      })
      .addCase(fetchSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Group
      .addCase(fetchSettingsGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettingsGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(fetchSettingsGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save
      .addCase(saveSettingsGroup.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveSettingsGroup.fulfilled, (state) => {
        state.isSaving = false;
        state.error = null;
      })
      .addCase(saveSettingsGroup.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
