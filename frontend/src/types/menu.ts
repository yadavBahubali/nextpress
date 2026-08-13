export interface MenuSettings {
  mega_menu_enabled?: boolean;
  mobile_enabled?: boolean;
  sticky?: boolean;
  [key: string]: any;
}

export interface MenuItemSettings {
  open_in_new_tab?: boolean;
  icon?: string;
  badge_text?: string;
  css_class?: string;
  description?: string;
  visibility?: 'all' | 'logged_in' | 'logged_out';
  [key: string]: any;
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  location: string | null;
  settings_json: MenuSettings | null;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string | number; // String for unsaved dragged items, number for saved
  menu_id: number;
  parent_id: string | number | null;
  type: 'page' | 'blog' | 'product' | 'category' | 'custom_url' | 'anchor' | 'external_link' | 'dynamic_collection' | 'cta_button' | 'announcement_header';
  entity_id: number | null;
  label: string;
  url: string | null;
  sort_order: number;
  settings_json: MenuItemSettings | null;
  
  // Frontend virtual properties (not in DB)
  children?: MenuItem[];
  depth?: number;
}

export interface EntitySearchItem {
  id: number;
  title: string;
  slug: string;
  type: string;
}
