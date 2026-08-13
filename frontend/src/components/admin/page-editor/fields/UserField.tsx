"use client";

import React, { useEffect, useState } from "react";
import { Field } from "@/types/acf";
import { usersService, User } from "@/services/users.service";

interface Props {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export default function UserField({ field, value, onChange }: Props) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    usersService.getAll()
      .then((res) => setUsers(res.data))
      // GET /users is Super Admin/Admin only - an Editor filling out this
      // entry can't list every account, so fall back to a read-only view of
      // whatever's already assigned rather than breaking the whole form.
      .catch(() => setLoadError(true));
  }, []);

  if (loadError) {
    return (
      <div className="form-text small text-muted">
        {value ? `Currently assigned to user #${value}.` : "Not assigned."} Only a Super Admin/Admin can change this.
      </div>
    );
  }

  if (!users) {
    return <div className="form-text small text-muted">Loading users...</div>;
  }

  return (
    <select
      className="form-select form-select-sm border-solid"
      value={value || ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      required={field.required}
      style={{ fontSize: "0.9rem" }}
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.email})
        </option>
      ))}
    </select>
  );
}
