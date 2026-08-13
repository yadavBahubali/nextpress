import { create } from 'zustand';
import { Menu, MenuItem, MenuSettings, EntitySearchItem } from '@/types/menu';
import { menusService } from '@/services/menus.service';

interface MenuBuilderState {
  // DATA
  activeMenuId: number | null;
  menuSettings: MenuSettings;
  menuName: string;
  menuLocation: string | null;
  items: MenuItem[]; // 1D array with parent_id and sort_order
  
  // UI STATE
  selectedItemId: string | number | null;
  isDragging: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  
  // ACTIONS
  loadMenu: (id: number) => Promise<void>;
  resetMenu: () => void;
  updateMenuSettings: (data: Partial<{ name: string; location: string; settings_json: MenuSettings }>) => void;
  
  addItems: (entities: EntitySearchItem[], parentId?: string | number | null) => void;
  addCustomItem: (data: { label: string; url: string; type: string }) => void;
  removeItem: (id: string | number) => void;
  updateItem: (id: string | number, data: Partial<MenuItem>) => void;
  moveItem: (id: string | number, newParentId: string | number | null, newIndex: number) => void;
  
  setSelectedItem: (id: string | number | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  
  saveMenu: () => Promise<void>;
}

export const useMenuBuilderStore = create<MenuBuilderState>((set, get) => ({
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
  
  loadMenu: async (id) => {
    set({ isLoading: true, selectedItemId: null });
    try {
      const response = await menusService.getMenuById(id);
      const menu = response.data;
      
      set({
        activeMenuId: menu.id,
        menuName: menu.name,
        menuLocation: menu.location,
        menuSettings: menu.settings_json || {},
        items: menu.items || [],
        isLoading: false,
        isDirty: false
      });
    } catch (error) {
      console.error('Failed to load menu', error);
      set({ isLoading: false });
    }
  },

  resetMenu: () => {
    set({
      activeMenuId: null,
      menuSettings: {},
      menuName: '',
      menuLocation: null,
      items: [],
      selectedItemId: null,
      isDirty: false
    });
  },

  updateMenuSettings: (data) => {
    set((state) => ({
      menuName: data.name !== undefined ? data.name : state.menuName,
      menuLocation: data.location !== undefined ? data.location : state.menuLocation,
      menuSettings: data.settings_json !== undefined ? { ...state.menuSettings, ...data.settings_json } : state.menuSettings,
      isDirty: true
    }));
  },

  addItems: (entities, parentId = null) => {
    set((state) => {
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
      
      return {
        items: [...state.items, ...newItems],
        isDirty: true
      };
    });
  },

  addCustomItem: (data) => {
    set((state) => {
      const newItem: MenuItem = {
        id: `temp-${Date.now()}`,
        menu_id: state.activeMenuId!,
        parent_id: null,
        type: data.type as any,
        entity_id: null,
        label: data.label,
        url: data.url,
        sort_order: state.items.length,
        settings_json: null
      };
      
      return {
        items: [...state.items, newItem],
        isDirty: true
      };
    });
  },

  removeItem: (id) => {
    set((state) => {
      // Find all children recursively to delete them too
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

      const newItems = state.items.filter(item => !itemsToDelete.has(item.id));
      
      return {
        items: newItems,
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        isDirty: true
      };
    });
  },

  updateItem: (id, data) => {
    set((state) => ({
      items: state.items.map(item => item.id === id ? { ...item, ...data } : item),
      isDirty: true
    }));
  },

  moveItem: (id, newParentId, newIndex) => {
    set((state) => {
      const newItems = [...state.items];
      const itemIndex = newItems.findIndex(i => i.id === id);
      
      if (itemIndex > -1) {
        // Update parent
        newItems[itemIndex] = { ...newItems[itemIndex], parent_id: newParentId };
        
        // Re-calculate sort order based on position in tree
        // Note: For a robust dnd-kit implementation, this array is usually sorted exactly as displayed visually
        // So we just re-assign sort_order = index for all items after the move operation in the component
      }
      
      return { items: newItems, isDirty: true };
    });
  },

  setSelectedItem: (id) => set({ selectedItemId: id }),
  setIsDragging: (isDragging) => set({ isDragging }),

  saveMenu: async () => {
    const state = get();
    if (!state.activeMenuId) return;
    
    set({ isSaving: true });
    try {
      // 1. Update Menu Metadata
      await menusService.updateMenu(state.activeMenuId, {
        name: state.menuName,
        location: state.menuLocation,
        settings_json: state.menuSettings
      });
      
      // 2. Sync Hierarchy
      await menusService.syncMenuItems(state.activeMenuId, state.items);
      
      // Reload to get real DB IDs instead of temp string IDs
      await state.loadMenu(state.activeMenuId);
      
      set({ isDirty: false, isSaving: false });
    } catch (error) {
      console.error('Failed to save menu', error);
      set({ isSaving: false });
      throw error; // Rethrow to be caught by UI toast
    }
  }
}));
