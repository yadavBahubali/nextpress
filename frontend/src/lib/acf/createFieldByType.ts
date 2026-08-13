import { Field, FieldType } from "@/types/acf";

export function createFieldByType(field: Field, type: FieldType): Field {
  const baseField = {
    ...field,

    type,

    settings: {
      ...(field.settings || {}),
    },
  };

  switch (type) {
    //////////////////////////////////////////////////////
    // REPEATER
    //////////////////////////////////////////////////////
    case "repeater":
      return {
        ...baseField,

        subFields: "subFields" in field ? field.subFields || [] : [],

        settings: {
          layout: "table",

          buttonLabel: "Add Row",

          min: "",

          max: "",

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // ACCORDION
    //////////////////////////////////////////////////////
    case "accordion":
      return {
        ...baseField,

        subFields: "subFields" in field ? field.subFields || [] : [],

        settings: {
          open: false,
          multi_expand: false,
          endpoint: false,
          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // TAB
    //////////////////////////////////////////////////////
    case "tab":
      return {
        ...baseField,

        subFields: "subFields" in field ? field.subFields || [] : [],

        settings: {
          placement: "top",
          endpoint: false,
          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // SELECT
    //////////////////////////////////////////////////////
    case "select":
      return {
        ...baseField,

        settings: {
          choices: [],

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // CHECKBOX
    //////////////////////////////////////////////////////
    case "checkbox":
      return {
        ...baseField,

        settings: {
          choices: [],

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // RADIO
    //////////////////////////////////////////////////////
    case "radio":
      return {
        ...baseField,

        settings: {
          choices: [],

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // TRUE / FALSE
    //////////////////////////////////////////////////////
    case "true_false":
      return {
        ...baseField,

        settings: {
          defaultValue: false,

          ...(field.settings || {}),
        },
      } as Field;
    //////////////////////////////////////////////////////
    // IMAGE
    //////////////////////////////////////////////////////
    case "image":
      return {
        ...baseField,

        settings: {
          mediaType: "image",

          multiple: false,

          return_format: "array",

          library: "all",

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // FILE
    //////////////////////////////////////////////////////
    case "file":
      return {
        ...baseField,

        settings: {
          mediaType: "file",

          multiple: false,

          return_format: "array",

          library: "all",

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // GALLERY
    //////////////////////////////////////////////////////
    case "gallery":
      return {
        ...baseField,

        settings: {
          mediaType: "image",

          multiple: true,

          return_format: "array",

          library: "all",

          ...(field.settings || {}),
        },
      } as Field;

    //////////////////////////////////////////////////////
    // WYSIWYG
    //////////////////////////////////////////////////////
    case "wysiwyg":
      return {
        ...baseField,

        settings: {
          toolbar: "basic",

          mediaUpload: false,

          ...(field.settings || {}),
        },
      } as Field;
    //////////////////////////////////////////////////////
    // DEFAULT SIMPLE FIELD
    //////////////////////////////////////////////////////
    default:
      return {
        ...baseField,
      } as Field;
  }
}
