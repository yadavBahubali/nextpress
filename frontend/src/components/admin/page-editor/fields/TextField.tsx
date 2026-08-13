"use client";

import React from "react";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function TextField({ field, value, onChange }: Props) {
  const inputType = ["text", "email", "url", "password", "number"].includes(field.type) 
    ? field.type 
    : "text";

  return (
    <input
      type={inputType}
      className="form-control form-control-sm border-solid"
      value={value || ""}
      placeholder={field.placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
    />
  );
}
