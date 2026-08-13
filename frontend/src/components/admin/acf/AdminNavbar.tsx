"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutGrid, ArrowLeft } from "lucide-react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const params = useParams();
  const adminPath = (params?.admin as string) || "admin";
  
  const isDeep = pathname.includes("/edit/") || pathname.includes("/create");

  return (
    <nav className="wp-navbar">
      <div className="d-flex align-items-center h-100">
        {isDeep ? (
          <Link href={`/${adminPath}/acf`} className="wp-navbar-item active text-decoration-none">
            <ArrowLeft size={16} className="me-2" />
            Back to Field Groups
          </Link>
        ) : (
          <Link href={`/${adminPath}/acf`} className="wp-navbar-item active disabled text-decoration-none">
            <LayoutGrid size={16} className="me-2" />
            Field Groups
          </Link>
        )}
      </div>
    </nav>
  );
}
