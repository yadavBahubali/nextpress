"use client";

import React from "react";
import { useParams } from "next/navigation";
import PostTypeForm from "@/components/admin/cpt/PostTypeForm";

export default function EditPostTypePage() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const id = params?.id as string;

  return <PostTypeForm mode="edit" typeId={id} adminPath={adminPath} />;
}
