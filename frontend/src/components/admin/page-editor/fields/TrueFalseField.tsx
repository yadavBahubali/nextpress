"use client";

import React from "react";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function TrueFalseField({ field, value, onChange }: Props) {
  const id = `tf-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-check form-switch p-0 d-flex align-items-center gap-3">
      <input
        className="form-check-input ms-0"
        type="checkbox"
        role="switch"
        id={id}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '2.5rem', height: '1.25rem', cursor: 'pointer' }}
      />
      <label className="form-check-label small text-muted cursor-pointer" htmlFor={id}>
        {value ? "Enabled" : "Disabled"}
      </label>
    </div>
  );
}
