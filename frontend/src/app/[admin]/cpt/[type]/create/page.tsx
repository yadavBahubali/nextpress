"use client";

import React from "react";
import { useParams } from "next/navigation";
import CptEntryEditor from "@/components/admin/cpt/CptEntryEditor";

export default function CreateCptEntryPage() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  const postType = params?.type as string;

  return <CptEntryEditor mode="create" postType={postType} adminPath={adminPath} />;
}
