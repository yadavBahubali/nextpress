"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkAuth, logoutUser } from "@/store/slices/authSlice";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { setUser: setZustandUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);

  // Sync Redux user to Zustand user
  useEffect(() => {
    if (user) {
      setZustandUser(user);
    }
  }, [user, setZustandUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (initialized.current) return;
      
      const isLoginPath = pathname.endsWith("/login");
      if (isLoginPath) {
        return;
      }

      initialized.current = true;
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (err) {
        handleAuthFailure();
      }
    };

    const handleAuthFailure = () => {
      dispatch(logoutUser());
      setZustandUser(null);
      
      // If we're on an admin route, redirect to login
      const segments = pathname.split("/").filter(Boolean);
      const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
      
      // An admin route is one that starts with the configured adminPath
      const isAdminPath = segments[0] === adminPath;
      const isLoginPath = pathname.endsWith("/login");

      if (isAdminPath && !isLoginPath) {
        const searchParams = window.location.search;
        const fullPath = pathname + searchParams;
        router.push(`/${adminPath}/login?redirect=${encodeURIComponent(fullPath)}`);
      }
    };

    initializeAuth();
  }, [dispatch, pathname, router, setZustandUser]);

  // Handle periodic session validation or other global auth events
  useEffect(() => {
    // If we are on a protected route and lose auth state (e.g. cookie removed)
    // The axios interceptor handles API failures, but this handles manual cookie removal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-storage" && !e.newValue) {
        dispatch(logoutUser());
        
        const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
        const segments = pathname.split("/").filter(Boolean);
        
        if (segments[0] === adminPath) {
           // Redirect logic handled by middleware or manually
           window.location.reload(); 
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, pathname]);

  return <>{children}</>;
}
