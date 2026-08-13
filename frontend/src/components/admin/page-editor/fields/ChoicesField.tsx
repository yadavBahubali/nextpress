"use client";

import React from "react";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function ChoicesField({ field, value, onChange }: Props) {
  const choices = field.settings?.choices || [];

  if (field.type === "checkbox") {
    const currentValue = Array.isArray(value) ? value : (value ? [value] : []);

    const handleChange = (choiceValue: string, checked: boolean) => {
      if (checked) {
        onChange([...currentValue, choiceValue]);
      } else {
        onChange(currentValue.filter((v: string) => v !== choiceValue));
      }
    };

    return (
      <div className="d-flex flex-column gap-2">
        {choices.map((choice: any, index: number) => (
          <div key={choice.value} className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`${field.id}-${index}`}
              checked={currentValue.includes(choice.value)}
              onChange={(e) => handleChange(choice.value, e.target.checked)}
            />
            <label className="form-check-label small" htmlFor={`${field.id}-${index}`}>
              {choice.label}
            </label>
          </div>
        ))}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="d-flex flex-column gap-2">
        {choices.map((choice: any, index: number) => (
          <div key={choice.value} className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={field.id}
              id={`${field.id}-${index}`}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <label className="form-check-label small" htmlFor={`${field.id}-${index}`}>
              {choice.label}
            </label>
          </div>
        ))}
      </div>
    );
  }

  // Default: Select
  return (
    <select
      className="form-select form-select-sm border-solid"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
    >
      <option value="">Select an option...</option>
      {choices.map((choice: any, index: number) => (
        <option key={index} value={choice.value}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}
