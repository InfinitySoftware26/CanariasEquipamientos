"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const { hydrated, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!selectedSocietyId && pathname !== "/select-society") {
      router.replace("/select-society");
    }
  }, [hydrated, isAuthenticated, selectedSocietyId, pathname, router]);
  console.log("PROTECTED ROUTE");
  console.log({
    hydrated,
    isAuthenticated,
    selectedSocietyId,
    pathname,
  });
  if (!hydrated) {
    console.log("RETURN HYDRATED FALSE");
    return null;
  }

  if (!isAuthenticated) {
    console.log("RETURN AUTH FALSE");
    return null;
  }

  return <>{children}</>;
}
