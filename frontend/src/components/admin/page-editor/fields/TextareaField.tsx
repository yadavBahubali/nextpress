"use client";

import React from "react";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function TextareaField({ field, value, onChange }: Props) {
  return (
    <textarea
      className="form-control form-control-sm border-solid"
      value={value || ""}
      placeholder={field.placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      rows={field.settings?.rows || 4}
      style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem', resize: 'vertical' }}
    />
  );
}
