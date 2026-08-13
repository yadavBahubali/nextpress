"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, parse } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Field } from "@/types/acf";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function DatePickerField({ field, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);
  
  const isTime = field.type === "time_picker";
  const isDateTime = field.type === "date_time_picker";
  const isDate = field.type === "date_picker";

  const displayFormat = isTime ? "HH:mm" : (isDateTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd");
  
  const selectedDate = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (isDateTime && selectedDate) {
      date.setHours(selectedDate.getHours());
      date.setMinutes(selectedDate.getMinutes());
    }
    
    onChange(format(date, displayFormat));
    if (!isDateTime) setIsOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value;
    if (isTime) {
      onChange(timeVal);
    } else if (isDateTime) {
      const [hours, minutes] = timeVal.split(':').map(Number);
      const newDate = selectedDate ? new Date(selectedDate) : new Date();
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onChange(format(newDate, displayFormat));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="acf-date-picker position-relative">
      <div className="input-group input-group-sm border-solid rounded overflow-hidden">
        <span className="input-group-text bg-light border-0">
          {isTime ? <Clock size={14} /> : <CalendarIcon size={14} />}
        </span>
        <input
          type="text"
          className="form-control border-0 bg-white"
          value={value || ""}
          placeholder={displayFormat}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          style={{ cursor: 'pointer', fontSize: '0.9rem' }}
        />
        {value && (
          <button 
            className="btn btn-light border-0 text-muted"
            onClick={() => onChange("")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          className="date-popover position-absolute" 
          ref={popover}
          style={{ 
            zIndex: 100, 
            top: "100%", 
            left: 0, 
            marginTop: "8px",
            background: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.2)"
          }}
        >
          {!isTime && (
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              className="m-0"
            />
          )}

          {(isTime || isDateTime) && (
            <div className={`pt-3 ${!isTime ? 'border-top mt-3' : ''}`}>
              <label className="form-label small fw-bold text-muted text-uppercase mb-2">Time</label>
              <input 
                type="time" 
                className="form-control form-control-sm" 
                value={value ? (isDateTime ? format(selectedDate!, "HH:mm") : value) : "12:00"}
                onChange={handleTimeChange}
              />
              {isDateTime && (
                <button 
                  className="btn btn-primary btn-sm w-100 mt-3" 
                  onClick={() => setIsOpen(false)}
                >
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .rdp {
          --rdp-cell-size: 32px;
          --rdp-accent-color: #2271b1;
          --rdp-background-color: #f0f0f1;
          margin: 0;
        }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
          background-color: var(--rdp-accent-color);
        }
      `}</style>
    </div>
  );
}
