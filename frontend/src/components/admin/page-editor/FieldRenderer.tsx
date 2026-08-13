"use client";

import React from "react";
import { Field } from "@/types/acf";
import TextField from "./fields/TextField";
import TextareaField from "./fields/TextareaField";
import RepeaterField from "./fields/RepeaterField";
import MediaField from "./fields/MediaField";
import ChoicesField from "./fields/ChoicesField";
import TrueFalseField from "./fields/TrueFalseField";
import WysiwygField from "./fields/WysiwygField";
import ColorPickerField from "./fields/ColorPickerField";
import DatePickerField from "./fields/DatePickerField";
import UserField from "./fields/UserField";
import SelfUploadMediaField from "./fields/SelfUploadMediaField";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  // When true, image/file/gallery fields (including ones nested inside a
  // repeater) use SelfUploadMediaField instead of MediaField - a
  // device-only file picker with no access to the shared Media Library, so
  // the founder portal (/my) can never let someone browse or delete
  // everyone else's uploads. See RepeaterField, which threads this through
  // to its own recursive FieldRenderer calls.
  restrictedMediaUpload?: boolean;
}

export default function FieldRenderer({ field, value, onChange, restrictedMediaUpload }: Props) {
  // Common wrapper for all fields to handle labels and instructions
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "url":
      case "password":
      case "number":
        return (
          <TextField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );
      
      case "textarea":
        return (
          <TextareaField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );

      case "repeater":
        return (
          <RepeaterField
            field={field}
            value={value}
            onChange={onChange}
            restrictedMediaUpload={restrictedMediaUpload}
          />
        );

      case "image":
      case "file":
      case "gallery":
        return restrictedMediaUpload ? (
          <SelfUploadMediaField
            field={field}
            value={value}
            onChange={onChange}
          />
        ) : (
          <MediaField
            field={field}
            value={value}
            onChange={onChange}
          />
        );

      case "select":
      case "checkbox":
      case "radio":
        return (
          <ChoicesField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );

      case "true_false":
        return (
          <TrueFalseField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );

      case "wysiwyg":
        return (
          <WysiwygField
            field={field}
            value={value}
            onChange={onChange}
            restrictedMediaUpload={restrictedMediaUpload}
          />
        );

      case "color_picker":
        return (
          <ColorPickerField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );

      case "date_picker":
      case "time_picker":
      case "date_time_picker":
        return (
          <DatePickerField 
            field={field} 
            value={value} 
            onChange={onChange} 
          />
        );

      case "user":
        return (
          <UserField
            field={field}
            value={value}
            onChange={onChange}
          />
        );

      case "tab":
      case "accordion":
        // Layout fields are handled by SectionList/GroupRenderer
        return null;

      default:
        return (
          <div className="text-danger small">
            Unsupported field type: {(field as any).type}
          </div>
        );
    }
  };

  if (field.type === "tab" || field.type === "accordion") return null;

  return (
    <div className="acf-runtime-field mb-4">
      <div className="d-flex flex-column gap-1 mb-2">
        <label className="fw-bold small text-dark d-flex align-items-center gap-2">
          {field.label}
          {field.required && <span className="text-danger">*</span>}
        </label>
        {field.instructions && (
          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
            {field.instructions}
          </p>
        )}
      </div>
      
      {renderField()}
    </div>
  );
}
