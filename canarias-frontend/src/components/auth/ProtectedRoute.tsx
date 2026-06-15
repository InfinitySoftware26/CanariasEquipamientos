"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
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

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
