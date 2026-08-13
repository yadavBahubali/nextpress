"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import BootstrapClient from "@/components/common/BootstrapClient";
import "bootstrap/dist/css/bootstrap.min.css";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

// Roles allowed into the CMS admin panel at all - matches exactly what
// authorizeSection/authorize recognize as staff on the backend. Role 4 (the
// public/customer default, including founders using /my) is deliberately
// excluded: they must never even land on an /admin page, regardless of
// what any individual API call would or wouldn't let them do.
const ADMIN_ELIGIBLE_ROLES = [1, 2, 3, 5];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
  const isLoginPage = pathname === `/${adminPath}/login`;
  const { setUser } = useAuthStore();

  const [isChecking, setIsChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const res = await authService.me();
        if (cancelled) return;

        if (!ADMIN_ELIGIBLE_ROLES.includes(res.user.role_id)) {
          // A real, logged-in account - just not one with any business in
          // the CMS (e.g. a founder using /my). Send them back to the
          // public site rather than the admin login, which would wrongly
          // imply they should be signing in here at all.
          router.replace("/");
          return;
        }

        setUser(res.user);
        setIsChecking(false);
      } catch {
        if (cancelled) return;
        // No valid session at all.
        router.replace(`/${adminPath}/login?redirect=${encodeURIComponent(pathname || "")}`);
      }
    };

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname, adminPath, router, setUser]);

  if (isLoginPage) {
    return (
      <>
        <BootstrapClient />
        <main>{children}</main>
      </>
    );
  }

  if (isChecking) {
    return (
      <>
        <BootstrapClient />
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BootstrapClient />
      <div className="admin-layout d-flex">
        <Sidebar />
        <div className="flex-grow-1" style={{ marginLeft: "250px" }}>
          <Topbar />
          <main className="bg-light min-vh-100">{children}</main>
        </div>
      </div>
    </>
  );
}
