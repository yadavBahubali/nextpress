"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useACFStore } from "@/store/acfStore";
import FieldCard from "./FieldCard";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  field: any;
}

export default function RepeaterFieldEditor({
  field,
}: Props) {
  const { addField, reorderFields, updateFieldSetting } = useACFStore();
  const settings = field.settings || {};

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const subFields = field.subFields || [];
      const oldIndex = subFields.findIndex((f: any) => f.id === active.id);
      const newIndex = subFields.findIndex((f: any) => f.id === over.id);
      reorderFields(oldIndex, newIndex, field.id);
    }
  };

  return (
    <div className="mt-4 border-top pt-4">
      {/* REPEATER SETTINGS */}
      <div className="row g-4 mb-4">
        {/* LAYOUT */}
        <div className="col-md-3">
          <div className="wp-form-group">
            <label className="wp-form-label">
              Layout
            </label>

            <select
              className="wp-form-select"
              value={settings.layout || "table"}
              onChange={(e) =>
                updateFieldSetting(field.id, "layout", e.target.value)
              }
            >
              <option value="table">
                Table
              </option>

              <option value="block">
                Block
              </option>

              <option value="row">
                Row
              </option>
            </select>
          </div>
        </div>

        {/* BUTTON LABEL */}
        <div className="col-md-3">
          <div className="wp-form-group">
            <label className="wp-form-label">
              Button Label
            </label>

            <input
              type="text"
              className="wp-form-control"
              value={
                settings.buttonLabel ||
                "Add Row"
              }
              onChange={(e) =>
                updateFieldSetting(field.id, "buttonLabel", e.target.value)
              }
            />
          </div>
        </div>

        {/* MIN */}
        <div className="col-md-3">
          <div className="wp-form-group">
            <label className="wp-form-label">
              Minimum Rows
            </label>

            <input
              type="number"
              className="wp-form-control"
              value={settings.min || ""}
              onChange={(e) =>
                updateFieldSetting(field.id, "min", e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
        </div>

        {/* MAX */}
        <div className="col-md-3">
          <div className="wp-form-group">
            <label className="wp-form-label">
              Maximum Rows
            </label>

            <input
              type="number"
              className="wp-form-control"
              value={settings.max || ""}
              onChange={(e) =>
                updateFieldSetting(field.id, "max", e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>
        </div>
      </div>

      {/* SUB FIELDS */}
      <div className="border rounded bg-light-subtle p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 fw-semibold">
            Sub Fields
          </h6>

          <button
            className="wp-button-outline"
            onClick={() => addField(field.id)}
          >
            <Plus
              size={14}
              className="me-1"
            />
            Add Sub Field
          </button>
        </div>

        {!field.subFields?.length ? (
          <div className="text-center py-4 text-muted small">
            No sub fields yet.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={field.subFields.map((f: any) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="d-flex flex-column gap-2">
                {field.subFields.map(
                  (
                    subField: any,
                    index: number
                  ) => (
                    <FieldCard
                      key={subField.id}
                      field={subField}
                      index={index} 
                    />
                  )
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
