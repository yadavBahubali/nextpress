"use client";

import React from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Type,
  Image as ImageIcon,
  FileText,
  Layout,
  List,
  Link,
  Hash,
  Mail,
  Lock,
  File,
  GalleryHorizontal,
  CheckSquare,
  Circle,
  ToggleLeft,
  User,
} from "lucide-react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
  index: number;
  dragHandleProps?: any;
}

export default function FieldHeader({ field, index, dragHandleProps }: Props) {
  const { toggleField } = useACFStore();

  const handleToggle = () => {
    toggleField(field.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type size={14} />;

      case "textarea":
        return <FileText size={14} />;

      case "number":
        return <Hash size={14} />;

      case "email":
        return <Mail size={14} />;

      case "url":
        return <Link size={14} />;

      case "password":
        return <Lock size={14} />;

      case "image":
        return <ImageIcon size={14} />;

      case "file":
        return <File size={14} />;

      case "gallery":
        return <GalleryHorizontal size={14} />;

      case "wysiwyg":
        return <FileText size={14} />;

      case "select":
        return <List size={14} />;

      case "checkbox":
        return <CheckSquare size={14} />;

      case "radio":
        return <Circle size={14} />;

      case "true_false":
        return <ToggleLeft size={14} />;

      case "repeater":
        return <List size={14} />;

      case "tab":
        return <Layout size={14} />;

      case "accordion":
        return <Layout size={14} />;

      case "user":
        return <User size={14} />;

      default:
        return <Type size={14} />;
    }
  };

  return (
    <div className="wp-field-header" onClick={handleToggle}>
      <div 
        className="wp-field-handle" 
        {...dragHandleProps} 
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'move' }}
      >
        <GripVertical size={16} />
      </div>

      <div className="wp-field-row-num">{index + 1}</div>

      <div className="text-muted me-2">
        {field.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>

      <div className="wp-field-title-group">
        <span className="wp-field-title-label">
          {field.label || "(no label)"}
        </span>
        <span className="wp-field-title-name">{field.name || "—"}</span>
        <span className="wp-field-title-key">{field.key}</span>
      </div>

      <div className="wp-field-type-badge">
        {getIcon(field.type)}
        {field.type}
      </div>
    </div>
  );
}
