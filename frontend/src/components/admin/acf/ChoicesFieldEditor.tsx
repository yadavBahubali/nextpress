"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useACFStore } from "@/store/acfStore";

interface Props {
  field: any;
}

export default function ChoicesFieldEditor({ field }: Props) {
  const { updateFieldSetting } = useACFStore();
  const settings = field.settings || {};
  const choices = settings.choices || [];

  //////////////////////////////////////////////////////
  // ADD CHOICE
  //////////////////////////////////////////////////////

  const addChoice = () => {
    updateFieldSetting(field.id, "choices", [
      ...choices,
      {
        label: "",
        value: "",
      },
    ]);
  };

  //////////////////////////////////////////////////////
  // REMOVE CHOICE
  //////////////////////////////////////////////////////

  const removeChoice = (index: number) => {
    const updated = [...choices];
    updated.splice(index, 1);
    updateFieldSetting(field.id, "choices", updated);
  };

  //////////////////////////////////////////////////////
  // UPDATE CHOICE
  //////////////////////////////////////////////////////

  const updateChoice = (
    index: number,
    key: "label" | "value",
    value: string,
  ) => {
    const updated = [...choices];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    updateFieldSetting(field.id, "choices", updated);
  };

  return (
    <div className="mt-4 border-top pt-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-semibold mb-0">Choices</h6>

        <button className="wp-button-outline" onClick={addChoice}>
          <Plus size={14} className="me-1" />
          Add Choice
        </button>
      </div>

      {/* EMPTY */}
      {!choices.length ? (
        <div className="text-center py-4 border rounded bg-light-subtle text-muted small">
          No choices added yet.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {choices.map((choice: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-light-subtle">
              <div className="row g-3 align-items-end">
                {/* LABEL */}
                <div className="col-md-5">
                  <label className="wp-form-label">Label</label>

                  <input
                    type="text"
                    className="wp-form-control"
                    value={choice.label || ""}
                    onChange={(e) =>
                      updateChoice(index, "label", e.target.value)
                    }
                  />
                </div>

                {/* VALUE */}
                <div className="col-md-5">
                  <label className="wp-form-label">Value</label>

                  <input
                    type="text"
                    className="wp-form-control"
                    value={choice.value || ""}
                    onChange={(e) =>
                      updateChoice(index, "value", e.target.value)
                    }
                  />
                </div>

                {/* DELETE */}
                <div className="col-md-2">
                  <button
                    className="btn btn-link text-danger text-decoration-none"
                    onClick={() => removeChoice(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
