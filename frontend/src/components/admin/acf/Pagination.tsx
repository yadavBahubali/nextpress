"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Pagination() {
  return (
    <div className="wp-toolbar justify-content-end">
      <div className="wp-pagination">
        <span className="me-2">6 items</span>
        
        <button className="wp-pagination-button disabled opacity-50"><ChevronsLeft size={14} /></button>
        <button className="wp-pagination-button disabled opacity-50"><ChevronLeft size={14} /></button>
        
        <span className="wp-pagination-current">
          1 of 1
        </span>
        
        <button className="wp-pagination-button disabled opacity-50"><ChevronRight size={14} /></button>
        <button className="wp-pagination-button disabled opacity-50"><ChevronsRight size={14} /></button>
      </div>
    </div>
  );
}
