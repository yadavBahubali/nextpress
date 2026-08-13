"use client";

import React from "react";
import { useParams } from "next/navigation";
import BlogEditor from "@/components/admin/blog-editor/BlogEditor";

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;
  const adminPath = (params?.admin as string) || "admin";

  if (!id) return null;

  return <BlogEditor postId={id} adminPath={adminPath} />;
}
