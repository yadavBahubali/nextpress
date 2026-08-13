// src/types/acf.ts

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "url"
  | "password"
  | "image"
  | "file"
  | "gallery"
  | "wysiwyg"
  | "select"
  | "checkbox"
  | "radio"
  | "true_false"
  | "repeater"
  | "accordion"
  | "tab"
  | "color_picker"
  | "date_picker"
  | "time_picker"
  | "date_time_picker"
  | "user";

export interface BaseField {
  id: string;

  label: string;

  name: string;

  type: FieldType;

  key: string;

  // Core field settings
  instructions?: string;

  required?: boolean;

  defaultValue?: any;

  placeholder?: string;

  // Presentation
  wrapper?: {
    width?: string;
    class?: string;
    id?: string;
  };

  // UI State ONLY
  open?: boolean;

  activeTab?:
    | "general"
    | "validation"
    | "presentation"
    | "conditional_logic";

  // Dynamic field settings
  settings?: Record<string, any>;

  // Conditional logic
  conditional_logic?: any;
}

export interface RepeaterField extends BaseField {
  type: "repeater";

  subFields: Field[];

  layout?: "table" | "block" | "row";

  buttonLabel?: string;

  min?: number;

  max?: number;
}

export interface AccordionField extends BaseField {
  type: "accordion";

  subFields: Field[];
}

export interface TabField extends BaseField {
  type: "tab";

  subFields: Field[];
}

export interface SelectField extends BaseField {
  type: "select";

  choices: {
    label: string;
    value: string;
  }[];
}

export type Field =
  | BaseField
  | RepeaterField
  | AccordionField
  | TabField
  | SelectField;

//////////////////////////////////////////////////////
// GROUP TYPES
//////////////////////////////////////////////////////

export interface GroupPresentationSettings {
  style: string;

  position: string;

  label_placement: string;

  instruction_placement: string;

  order_no?: number;
}

export interface GroupSettings {
  location_rules: any[];

  presentation: GroupPresentationSettings;

  hide_on_screen: string[];

  show_in_rest: boolean;

  active: boolean;
}

export interface FieldGroup {
  id?: string;

  title: string;

  description?: string;

  groupKey: string;

  fields: Field[];

  settings: GroupSettings;

  page_id?: number | null;

  order_index?: number;
}