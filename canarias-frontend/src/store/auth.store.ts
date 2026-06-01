import { create } from "zustand";
import { persist } from "zustand/middleware";

import { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;

  hydrated: boolean;

  setHydrated: () => void;

  setAuth: (data: { user: User; accessToken: string }) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      hydrated: false,

      setHydrated: () =>
        set({
          hydrated: true,
        }),

      setAuth: ({ user, accessToken }) =>
        set({
          user,
          accessToken,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
        }),
    }),
    {
      name: "canarias-auth",

      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
