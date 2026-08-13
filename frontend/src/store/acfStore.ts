import { create } from 'zustand';
import { Field, FieldGroup, FieldType } from '@/types/acf';

interface ACFStore {
  fieldGroup: FieldGroup & { id: string }; // Ensure ID is present for local state
  
  // Actions
  setFieldGroup: (group: Partial<FieldGroup & { id: string }>) => void;
  setGroupTitle: (title: string) => void;
  setGroupDescription: (description: string) => void;
  updateFieldGroup: (key: keyof (FieldGroup & { id: string }), value: any) => void;
  updateGroupSettings: (key: string, value: any) => void;
  updatePresentationSetting: (key: string, value: any) => void;
  resetStore: () => void;
  
  // Field Actions
  addField: (parentId?: string) => void;
  updateField: (id: string, key: string, value: any) => void;
  updateFieldSetting: (id: string, key: string, value: any) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  reorderFields: (oldIndex: number, newIndex: number, parentId?: string) => void;
  toggleField: (id: string) => void;
}

const initialFieldGroup: FieldGroup & { id: string } = {
  id: '',
  title: '',
  description: '',
  groupKey: '',
  fields: [],
  page_id: null,
  order_index: 0,
  settings: {
    active: true,
    location_rules: [],
    presentation: {
      style: 'default',
      position: 'normal',
      label_placement: 'top',
      instruction_placement: 'label',
    },
    hide_on_screen: [],
    show_in_rest: true,
  },
};

export const useACFStore = create<ACFStore>((set) => ({
  fieldGroup: initialFieldGroup,

  setFieldGroup: (group) => set((state) => ({
    fieldGroup: { ...state.fieldGroup, ...group } as any
  })),

  setGroupTitle: (title) => set((state) => {
    // Auto-generate groupKey from title if it's currently empty or was previously auto-generated
    const slugify = (text: string) => text
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/_+/g, "_");

    return {
      fieldGroup: { 
        ...state.fieldGroup, 
        title,
        groupKey: state.fieldGroup.groupKey === slugify(state.fieldGroup.title) || !state.fieldGroup.groupKey
          ? slugify(title)
          : state.fieldGroup.groupKey
      }
    };
  }),

  setGroupDescription: (description) => set((state) => ({
    fieldGroup: { ...state.fieldGroup, description }
  })),

  updateFieldGroup: (key, value) => set((state) => ({
    fieldGroup: { ...state.fieldGroup, [key]: value }
  })),

  updateGroupSettings: (key, value) => set((state) => ({
    fieldGroup: {
      ...state.fieldGroup,
      settings: { ...state.fieldGroup.settings, [key]: value }
    }
  })),

  updatePresentationSetting: (key, value) => set((state) => ({
    fieldGroup: {
      ...state.fieldGroup,
      settings: {
        ...state.fieldGroup.settings,
        presentation: {
          ...state.fieldGroup.settings.presentation,
          [key]: value
        }
      }
    }
  })),

  resetStore: () => set({ fieldGroup: initialFieldGroup }),

  addField: (parentId) => set((state) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      key: `field_${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field',
      name: 'new_field',
      type: 'text' as FieldType,
      required: false,
      settings: {},
      wrapper: { width: '100%', class: '', id: '' },
      open: true,
      activeTab: 'general',
    };

    if (!parentId) {
      return {
        fieldGroup: {
          ...state.fieldGroup,
          fields: [...state.fieldGroup.fields, newField]
        }
      };
    }

    const updateFieldsRecursive = (fields: Field[]): Field[] => {
      return fields.map(f => {
        if (f.id === parentId) {
          const subFields = (f as any).subFields || [];
          return { ...f, subFields: [...subFields, newField] } as any;
        }
        if ((f as any).subFields) {
          return { ...f, subFields: updateFieldsRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: updateFieldsRecursive(state.fieldGroup.fields)
      }
    };
  }),

  updateField: (id, key, value) => set((state) => {
    const updateRecursive = (fields: Field[]): Field[] => {
      return fields.map(f => {
        if (f.id === id) {
          return { ...f, [key]: value };
        }
        if ((f as any).subFields) {
          return { ...f, subFields: updateRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: updateRecursive(state.fieldGroup.fields)
      }
    };
  }),

  updateFieldSetting: (id, key, value) => set((state) => {
    const updateRecursive = (fields: Field[]): Field[] => {
      return fields.map(f => {
        if (f.id === id) {
          return { ...f, settings: { ...f.settings, [key]: value } };
        }
        if ((f as any).subFields) {
          return { ...f, subFields: updateRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: updateRecursive(state.fieldGroup.fields)
      }
    };
  }),

  removeField: (id) => set((state) => {
    const removeRecursive = (fields: Field[]): Field[] => {
      return fields.filter(f => f.id !== id).map(f => {
        if ((f as any).subFields) {
          return { ...f, subFields: removeRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: removeRecursive(state.fieldGroup.fields)
      }
    };
  }),

  duplicateField: (id) => set((state) => {
    const findAndDuplicate = (fields: Field[]): { fields: Field[], duplicated?: Field } => {
      let duplicated: Field | undefined;
      const newFields = fields.flatMap(f => {
        if (f.id === id) {
          duplicated = {
            ...f,
            id: `field_${Date.now()}_dup`,
            key: `${f.key}_copy`,
            name: `${f.name}_copy`,
            label: `${f.label} (Copy)`
          };
          return [f, duplicated];
        }
        if ((f as any).subFields) {
          const result = findAndDuplicate((f as any).subFields);
          if (result.duplicated) {
            return [{ ...f, subFields: result.fields } as any];
          }
        }
        return [f];
      });
      return { fields: newFields, duplicated };
    };

    const result = findAndDuplicate(state.fieldGroup.fields);
    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: result.fields
      }
    };
  }),

  reorderFields: (oldIndex, newIndex, parentId) => set((state) => {
    if (!parentId) {
      const newFields = [...state.fieldGroup.fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);
      return {
        fieldGroup: {
          ...state.fieldGroup,
          fields: newFields
        }
      };
    }

    const reorderRecursive = (fields: Field[]): Field[] => {
      return fields.map(f => {
        if (f.id === parentId) {
          const subFields = [...((f as any).subFields || [])];
          const [removed] = subFields.splice(oldIndex, 1);
          subFields.splice(newIndex, 0, removed);
          return { ...f, subFields: subFields } as any;
        }
        if ((f as any).subFields) {
          return { ...f, subFields: reorderRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: reorderRecursive(state.fieldGroup.fields)
      }
    };
  }),

  toggleField: (id) => set((state) => {
    const toggleRecursive = (fields: Field[]): Field[] => {
      return fields.map(f => {
        if (f.id === id) {
          return { ...f, open: !f.open };
        }
        if ((f as any).subFields) {
          return { ...f, subFields: toggleRecursive((f as any).subFields) } as any;
        }
        return f;
      });
    };

    return {
      fieldGroup: {
        ...state.fieldGroup,
        fields: toggleRecursive(state.fieldGroup.fields)
      }
    };
  }),
}));
