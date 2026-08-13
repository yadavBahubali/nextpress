"use client";

import React, { useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { FormField } from "@/services/forms.service";
import SortableFieldItem from "./SortableFieldItem";

interface Props {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export default function FormFieldsBuilder({ fields, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Count how many fields share each name, so duplicates (which would
  // silently overwrite each other's value in the submitted JSON) are
  // flagged inline instead of failing invisibly after a real visitor submits.
  const duplicateNames = useMemo(() => {
    const counts: Record<string, number> = {};
    fields.forEach((f) => {
      const key = (f.name || "").trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([name]) => name));
  }, [fields]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type: "text",
      name: `field_${fields.length + 1}`,
      label: "New Field",
      placeholder: "",
      required: false,
      width: "col-12",
    };
    onChange([...fields, newField]);
  };

  const handleUpdate = (fieldId: string, updates: Partial<FormField>) => {
    onChange(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const handleRemove = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId));
  };

  return (
    <div className="fields-container d-flex flex-column gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              index={index}
              isDuplicateName={duplicateNames.has((field.name || "").trim())}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        className="btn btn-outline-primary border-dashed py-3 d-flex align-items-center justify-content-center gap-2"
        onClick={handleAddField}
        style={{ borderStyle: "dashed" }}
      >
        <FaPlus /> Add Another Field
      </button>
    </div>
  );
}

/**
 * Returns a validation error message if any two fields share the same
 * internal name (they'd silently overwrite each other's submitted value),
 * or if a select/radio field has no choices defined yet. Null if the field
 * list is valid to save.
 */
export function validateFormFields(fields: FormField[]): string | null {
  const seen = new Set<string>();
  for (const field of fields) {
    const name = (field.name || "").trim();
    if (!name) return "Every field needs an internal name.";
    if (seen.has(name)) return `Two fields are both named "${name}" - rename one before saving.`;
    seen.add(name);

    if ((field.type === "select" || field.type === "radio") && (!field.options || field.options.length === 0)) {
      return `"${field.label || name}" is a ${field.type === "select" ? "dropdown" : "radio group"} with no choices defined yet.`;
    }
  }
  return null;
}
