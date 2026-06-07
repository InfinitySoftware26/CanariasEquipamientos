"use client";

import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);

  const isAuthenticated = Boolean(user && accessToken);

  return {
    user,
    accessToken,
    hydrated,
    isAuthenticated,
    isReady: hydrated,
  };
}
