import { create } from 'zustand';

export type FieldType = 
  | 'text' | 'textarea' | 'number' | 'range' | 'email' | 'url' | 'password' // Basic
  | 'image' | 'file' | 'video' | 'gallery'                                // Media
  | 'wysiwyg' | 'embed'                                                  // Content
  | 'select' | 'checkbox' | 'radio' | 'button_group' | 'boolean'           // Selection
  | 'repeater' | 'accordion' | 'tabs' | 'clone'                          // Advanced
  | 'datepicker' | 'datetime_picker' | 'time_picker'                      // Date
  | 'color_picker' | 'google_map' | 'link';                               // Utility

export interface FieldSchema {
  id: string;
  label: string;
  name: string; // The slug/key
  type: FieldType;
  parent_id?: string;
  order_no: number;
  width?: string; // Mapped from settings for easy access
  required?: boolean; // Mapped from settings for easy access
  settings: {
    placeholder?: string;
    helpText?: string;
    required?: boolean;
    width?: string;
    cssClass?: string;
    defaultValue?: any;
    validation?: any;
    conditionalLogic?: any;
    uniqueKey?: string;
    // Type specific settings
    choices?: string; // For select/radio
    min?: number;
    max?: number;
    allowedTypes?: string;
    returnFormat?: string;
  };
  options?: any; // Alias for settings to support legacy components
  subFields?: FieldSchema[]; // Recursive children
}

export interface SectionSchema {
  id: string;
  page_id?: string;
  name: string;
  slug: string;
  type: string; // Added to support SectionEntry.tsx
  order_no: number;
  fields: FieldSchema[];
}

export type Section = SectionSchema; // Alias for legacy support

export interface PageSchema {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sections: SectionSchema[];
}

interface SchemaStore {
  currentPage: PageSchema;
  activeSectionId: string | null;
  activeFieldId: string | null;
  
  // Page Actions
  setPageTitle: (title: string) => void;
  setPageSlug: (slug: string) => void;
  
  // Section Actions
  addSection: (type?: string) => void;
  updateSection: (id: string, updates: Partial<SectionSchema>) => void;
  removeSection: (id: string) => void;
  setActiveSection: (id: string | null) => void;
  
  // Field Actions
  setActiveField: (id: string | null) => void;
  addField: (sectionId: string, parentId?: string, type?: FieldType) => void;
  updateField: (id: string, updates: Partial<FieldSchema>) => void;
  removeField: (id: string) => void;
}

export const useSchemaStore = create<SchemaStore>((set) => ({
  currentPage: {
    id: 'p_1',
    title: 'Home Page',
    slug: 'home',
    status: 'draft',
    sections: []
  },
  activeSectionId: null,
  activeFieldId: null,

  setPageTitle: (title) => set((state) => ({ currentPage: { ...state.currentPage, title } })),
  setPageSlug: (slug) => set((state) => ({ currentPage: { ...state.currentPage, slug } })),

  addSection: (type = 'default') => set((state) => {
    const newSection: SectionSchema = {
      id: `sec_${Date.now()}`,
      name: 'New Section',
      slug: `section_${state.currentPage.sections.length + 1}`,
      type: type,
      order_no: state.currentPage.sections.length,
      fields: []
    };
    return {
      currentPage: { ...state.currentPage, sections: [...state.currentPage.sections, newSection] },
      activeSectionId: newSection.id
    };
  }),

  updateSection: (id, updates) => set((state) => ({
    currentPage: {
      ...state.currentPage,
      sections: state.currentPage.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }
  })),

  removeSection: (id) => set((state) => ({
    currentPage: {
      ...state.currentPage,
      sections: state.currentPage.sections.filter(s => s.id !== id)
    },
    activeSectionId: state.activeSectionId === id ? null : state.activeSectionId
  })),

  setActiveSection: (id) => set({ activeSectionId: id }),
  setActiveField: (id) => set({ activeFieldId: id }),

  addField: (sectionId, parentId, type = 'text') => set((state) => {
    const newField: FieldSchema = {
      id: `f_${Date.now()}`,
      label: 'New Field',
      name: `field_${Math.floor(Math.random() * 1000)}`,
      type: type,
      order_no: 0,
      width: '100',
      required: false,
      settings: { width: '100', required: false },
      options: { width: '100', required: false }
    };

    const updateFieldsRecursive = (fields: FieldSchema[]): FieldSchema[] => {
      if (!parentId) return [...fields, { ...newField, order_no: fields.length }];
      return fields.map(f => {
        if (f.id === parentId) {
          const subFields = f.subFields || [];
          return { ...f, subFields: [...subFields, { ...newField, parent_id: parentId, order_no: subFields.length }] };
        }
        if (f.subFields) return { ...f, subFields: updateFieldsRecursive(f.subFields) };
        return f;
      });
    };

    return {
      currentPage: {
        ...state.currentPage,
        sections: state.currentPage.sections.map(s => 
          s.id === sectionId ? { ...s, fields: updateFieldsRecursive(s.fields) } : s
        )
      },
      activeFieldId: newField.id
    };
  }),

  updateField: (id, updates) => set((state) => {
    const updateRecursive = (fields: FieldSchema[]): FieldSchema[] => {
      return fields.map(f => {
        if (f.id === id) {
          const newSettings = updates.settings ? { ...f.settings, ...updates.settings } : f.settings;
          const newOptions = updates.options ? { ...f.options, ...updates.options } : (updates.settings ? { ...f.options, ...updates.settings } : f.options);
          
          return { 
            ...f, 
            ...updates, 
            settings: newSettings,
            options: newOptions,
            width: newSettings.width || f.width,
            required: newSettings.required || f.required
          };
        }
        if (f.subFields) return { ...f, subFields: updateRecursive(f.subFields) };
        return f;
      });
    };

    return {
      currentPage: {
        ...state.currentPage,
        sections: state.currentPage.sections.map(s => ({
          ...s,
          fields: updateRecursive(s.fields)
        }))
      }
    };
  }),

  removeField: (id) => set((state) => {
    const removeRecursive = (fields: FieldSchema[]): FieldSchema[] => {
      return fields.filter(f => f.id !== id).map(f => ({
        ...f,
        subFields: f.subFields ? removeRecursive(f.subFields) : undefined
      }));
    };

    return {
      currentPage: {
        ...state.currentPage,
        sections: state.currentPage.sections.map(s => ({
          ...s,
          fields: removeRecursive(s.fields)
        }))
      },
      activeFieldId: state.activeFieldId === id ? null : state.activeFieldId
    };
  })
}));

export const useBuilderStore = useSchemaStore; // Alias for legacy support
