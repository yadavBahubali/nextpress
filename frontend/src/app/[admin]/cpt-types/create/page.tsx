"use client";

import React from "react";
import { useParams } from "next/navigation";
import PostTypeForm from "@/components/admin/cpt/PostTypeForm";

export default function CreatePostTypePage() {
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";

  return <PostTypeForm mode="create" adminPath={adminPath} />;
}
