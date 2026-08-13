"use client";

import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPickerField({ field, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="acf-color-picker position-relative">
      <div className="d-flex align-items-center gap-2">
        <div 
          className="color-preview border rounded cursor-pointer" 
          style={{ 
            width: "38px", 
            height: "38px", 
            backgroundColor: value || "#FFFFFF",
            cursor: "pointer",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)"
          }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <input
          type="text"
          className="form-control form-control-sm border-solid fw-monospace text-uppercase"
          value={value || ""}
          placeholder="#FFFFFF"
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100px", fontSize: "0.85rem" }}
        />
        {value && (
          <button 
            className="btn btn-link btn-sm text-muted p-0 text-decoration-none"
            onClick={() => onChange("")}
            style={{ fontSize: "0.75rem" }}
          >
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          className="color-popover position-absolute" 
          ref={popover}
          style={{ 
            zIndex: 100, 
            top: "100%", 
            left: 0, 
            marginTop: "8px",
            background: "#fff",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.2)"
          }}
        >
          <HexColorPicker color={value || "#FFFFFF"} onChange={onChange} />
        </div>
      )}

      <style jsx>{`
        .fw-monospace {
          font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
      `}</style>
    </div>
  );
}
