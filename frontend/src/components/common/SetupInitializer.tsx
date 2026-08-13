"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setupService } from "@/services/setup.service";

export default function SetupInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
  const segments = pathname.split("/").filter(Boolean);

  // A public route is anything that is NOT an admin route and NOT the setup page
  const isPublicRoute =
    segments[0] !== adminPath && pathname !== "/setup";

  useEffect(() => {
    // Skip the setup check entirely on public routes — no API call, no loader
    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    const checkSetup = async () => {
      // Don't check if we are already on the setup page
      if (pathname === "/setup") {
        setChecking(false);
        return;
      }

      try {
        const res = await setupService.getStatus();
        if (res.status === "success" && !res.data.isInstalled) {
          router.push("/setup");
        }
      } catch (err) {
        console.error("Setup check failed", err);
      } finally {
        setChecking(false);
      }
    };

    checkSetup();
  }, [pathname, router, isPublicRoute]);

  // Only show the loader on non-public routes (admin/setup) while checking
  if (checking && !isPublicRoute) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Initializing NextPress...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
