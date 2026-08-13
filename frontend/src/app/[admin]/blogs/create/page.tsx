"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import BlogEditor from "@/components/admin/blog-editor/BlogEditor";

export default function CreateBlogPage() {
  const params = useParams();
  const router = useRouter();
  const adminPath = (params?.admin as string) || "admin";

  const handleSave = (post: any) => {
    router.push(`/${adminPath}/blogs/edit/${post.id}`);
  };

  return <BlogEditor adminPath={adminPath} onSave={handleSave} />;
}
