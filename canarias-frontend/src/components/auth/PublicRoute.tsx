"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { getDashboardRoute } from "@/lib/redirection-role";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();

  const { hydrated, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
