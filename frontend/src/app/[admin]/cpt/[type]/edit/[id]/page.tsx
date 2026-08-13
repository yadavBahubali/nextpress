"use client";

import React from "react";
import { useParams } from "next/navigation";
import CptEntryEditor from "@/components/admin/cpt/CptEntryEditor";

export default function EditCptEntryPage() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const postType = params?.type as string;
  const id = params?.id as string;

  return <CptEntryEditor mode="edit" postType={postType} entryId={id} adminPath={adminPath} />;
}
