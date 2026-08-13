"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Field } from "@/types/acf";
import ACFFieldRow from "./ACFFieldRow";

interface Props {
  fields: Field[];
}

export default function ACFFieldTable({ fields }: Props) {
  return (
    <div className="wp-card">
      <div className="wp-card-header">
        <span className="fw-medium">Fields</span>
        <ChevronDown size={16} className="text-muted" />
      </div>
      
      <table className="wp-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>Label</th>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {fields.length === 0 ? (
            <tr>
              <td colSpan={4} className="wp-table-cell text-center py-4 text-muted">
                No fields added yet.
              </td>
            </tr>
          ) : (
            fields.map((field, index) => (
              <ACFFieldRow key={field.id} field={field} index={index} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
