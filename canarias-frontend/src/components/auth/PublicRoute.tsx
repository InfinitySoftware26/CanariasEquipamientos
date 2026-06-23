"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/auth/useAuth";
import { getDashboardRoute } from "@/lib/redirection-role";
import { useAuthStore } from "@/store/auth.store";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();

  const { hydrated, isAuthenticated, user } = useAuth();
  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) return;

    if (!selectedSocietyId) {
      router.replace("/select-society");
      return;
    }

    router.replace(getDashboardRoute(user.role));
  }, [hydrated, isAuthenticated, user, selectedSocietyId, router]);

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
