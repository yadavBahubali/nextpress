import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Menu, MenuItem, MenuSettings, EntitySearchItem } from '@/types/menu';
import { menusService } from '@/services/menus.service';

interface MenuBuilderState {
  activeMenuId: number | null;
  menuSettings: MenuSettings;
  menuName: string;
  menuLocation: string | null;
  items: MenuItem[];
  selectedItemId: string | number | null;
  isDragging: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
}

const initialState: MenuBuilderState = {
  activeMenuId: null,
  menuSettings: {},
  menuName: '',
  menuLocation: null,
  items: [],
  selectedItemId: null,
  isDragging: false,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  error: null,
};

export const loadMenu = createAsyncThunk(
  'menuBuilder/load',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await menusService.getMenuById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load menu');
    }
  }
);

export const saveMenu = createAsyncThunk(
  'menuBuilder/save',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = (getState() as any).menuBuilder as MenuBuilderState;
    if (!state.activeMenuId) return rejectWithValue('No active menu');

    try {
      // 1. Update Menu Metadata
      await menusService.updateMenu(state.activeMenuId, {
        name: state.menuName,
        location: state.menuLocation,
        settings_json: state.menuSettings
      });
      
      // 2. Sync Hierarchy
      await menusService.syncMenuItems(state.activeMenuId, state.items);
      
      // Reload to get real DB IDs
      dispatch(loadMenu(state.activeMenuId));
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save menu');
    }
  }
);

const menuBuilderSlice = createSlice({
  name: 'menuBuilder',
  initialState,
  reducers: {
    resetMenu: (state) => {
      return initialState;
    },
    updateMenuSettings: (state, action: PayloadAction<Partial<{ name: string; location: string; settings_json: MenuSettings }>>) => {
      if (action.payload.name !== undefined) state.menuName = action.payload.name;
      if (action.payload.location !== undefined) state.menuLocation = action.payload.location;
      if (action.payload.settings_json !== undefined) {
        state.menuSettings = { ...state.menuSettings, ...action.payload.settings_json };
      }
      state.isDirty = true;
    },
    addItems: (state, action: PayloadAction<{ entities: EntitySearchItem[], parentId?: string | number | null }>) => {
      const { entities, parentId = null } = action.payload;
      const newItems: MenuItem[] = entities.map((e, index) => ({
        id: `temp-${Date.now()}-${index}`,
        menu_id: state.activeMenuId!,
        parent_id: parentId,
        type: e.type as any,
        entity_id: e.id,
        label: e.title,
        url: null,
        sort_order: state.items.length + index,
        settings_json: null
      }));
      state.items.push(...newItems);
      state.isDirty = true;
    },
    addCustomItem: (state, action: PayloadAction<{ label: string; url: string; type: string }>) => {
      const newItem: MenuItem = {
        id: `temp-${Date.now()}`,
        menu_id: state.activeMenuId!,
        parent_id: null,
        type: action.payload.type as any,
        entity_id: null,
        label: action.payload.label,
        url: action.payload.url,
        sort_order: state.items.length,
        settings_json: null
      };
      state.items.push(newItem);
      state.isDirty = true;
    },
    removeItem: (state, action: PayloadAction<string | number>) => {
      const id = action.payload;
      const itemsToDelete = new Set([id]);
      let added = true;
      
      while (added) {
        added = false;
        state.items.forEach(item => {
          if (item.parent_id && itemsToDelete.has(item.parent_id) && !itemsToDelete.has(item.id)) {
            itemsToDelete.add(item.id);
            added = true;
          }
        });
      }
      state.items = state.items.filter(item => !itemsToDelete.has(item.id));
      if (state.selectedItemId === id) state.selectedItemId = null;
      state.isDirty = true;
    },
    updateItem: (state, action: PayloadAction<{ id: string | number; data: Partial<MenuItem> }>) => {
      const { id, data } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...data };
        state.isDirty = true;
      }
    },
    setSelectedItem: (state, action: PayloadAction<string | number | null>) => {
      state.selectedItemId = action.payload;
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    setItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
      state.isDirty = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMenu.pending, (state) => {
        state.isLoading = true;
        state.selectedItemId = null;
      })
      .addCase(loadMenu.fulfilled, (state, action) => {
        const menu = action.payload;
        state.activeMenuId = menu.id;
        state.menuName = menu.name;
        state.menuLocation = menu.location;
        state.menuSettings = menu.settings_json || {};
        state.items = menu.items || [];
        state.isLoading = false;
        state.isDirty = false;
        state.error = null;
      })
      .addCase(loadMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveMenu.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveMenu.fulfilled, (state) => {
        state.isSaving = false;
        state.isDirty = false;
      })
      .addCase(saveMenu.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  resetMenu, updateMenuSettings, addItems, 
  addCustomItem, removeItem, updateItem, 
  setSelectedItem, setIsDragging, setItems 
} = menuBuilderSlice.actions;
export default menuBuilderSlice.reducer;
