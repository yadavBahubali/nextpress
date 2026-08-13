"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
}

export default function AccordionSection({ title, children, initialOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="card p-2 mb-4">
      <div 
        className="card-body bg-white cursor-pointer py-2 px-3 d-flex justify-content-between align-items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="fw-bold small text-uppercase" style={{ letterSpacing: '0.05em' }}>{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </div>
      
      {isOpen && (
        <div className="bg-white border-top">
          {children}
        </div>
      )}
    </div>
  );
}
