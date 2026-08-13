import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { menusService } from '@/services/menus.service';
import { Menu } from '@/types/menu';

interface MenuState {
  allMenus: Menu[];
  menus: Record<string, Menu>; // Map of location -> Menu
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: MenuState = {
  allMenus: [],
  menus: {},
  isLoading: false,
  isSaving: false,
  error: null,
};

export const fetchAllMenus = createAsyncThunk(
  'menu/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await menusService.getMenus();
      if (response?.status === 'success') {
        return response.data;
      }
      return rejectWithValue('Failed to fetch menus');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menus');
    }
  }
);

export const fetchMenuByLocation = createAsyncThunk(
  'menu/fetchByLocation',
  async (location: string, { rejectWithValue }) => {
    try {
      const response = await menusService.getMenuByLocation(location);
      if (response?.status === 'success' && response?.data) {
        return { location, menu: response.data };
      }
      return rejectWithValue('Failed to fetch menu');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const createMenu = createAsyncThunk(
  'menu/create',
  async (data: Partial<Menu>, { dispatch, rejectWithValue }) => {
    try {
      const response = await menusService.createMenu(data);
      if (response?.status === 'success') {
        dispatch(fetchAllMenus());
        return response.data;
      }
      return rejectWithValue('Failed to create menu');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create menu');
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'menu/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await menusService.deleteMenu(id);
      if (response?.status === 'success') {
        dispatch(fetchAllMenus());
        return id;
      }
      return rejectWithValue('Failed to delete menu');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllMenus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllMenus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMenus = action.payload;
        state.error = null;
      })
      .addCase(fetchAllMenus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch By Location
      .addCase(fetchMenuByLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMenuByLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menus[action.payload.location] = action.payload.menu;
        state.error = null;
      })
      .addCase(fetchMenuByLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createMenu.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createMenu.fulfilled, (state) => {
        state.isSaving = false;
        state.error = null;
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
