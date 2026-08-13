"use client";

import React from "react";
import { useACFStore } from "@/store/acfStore";

export default function ACFActionButtons() {
  const { addField } = useACFStore();
  
  return (
    <div className="d-flex align-items-center gap-2">
      <button
        className="wp-button wp-button-outline"
        onClick={() => addField()}
      >
        + Add Field
      </button>
      
      <button className="wp-button">
        Save Changes
      </button>
    </div>
  );
}
