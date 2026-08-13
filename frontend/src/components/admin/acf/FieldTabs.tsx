"use client";

import React from "react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  fieldId: string;
  activeTab: string;
}

export default function FieldTabs({ fieldId, activeTab }: Props) {
  const { updateField } = useACFStore();

  const tabs = [
    { id: "general", label: "General" },
    { id: "validation", label: "Validation" },
    { id: "presentation", label: "Presentation" },
    // { id: "conditional_logic", label: "Conditional Logic" },
  ];

  const handleTabClick = (tabId: string) => {
    updateField(fieldId, "activeTab", tabId);
  };

  return (
    <div className="wp-field-tabs">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`wp-field-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
