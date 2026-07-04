import { create } from "zustand";
import { persist } from "zustand/middleware";

import { StaffRole, User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;

  selectedSocietyId: string | null;
  selectedSociety: {
    id: string;
    name: string;
  } | null;

  activeRole: StaffRole | null;

  hydrated: boolean;

  setHydrated: () => void;

  setAuth: (data: { user: User; accessToken: string }) => void;

  setSelectedSociety: (
    societyId: string,
    societyName?: string,
    accessToken?: string,
  ) => void;

  setActiveRole: (role: StaffRole) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      selectedSocietyId: null,
      selectedSociety: null,

      activeRole: null,

      hydrated: false,

      setHydrated: () =>
        set({
          hydrated: true,
        }),

      setAuth: ({ user, accessToken }) =>
        set({
          user,
          accessToken,
          selectedSocietyId: null,
          selectedSociety: null,
          activeRole: user.role,
        }),

      setSelectedSociety: (
        societyId: string,
        societyName?: string,
        accessToken?: string,
      ) =>
        set((state) => ({
          selectedSocietyId: societyId,

          selectedSociety: societyName
            ? { id: societyId, name: societyName }
            : null,

          accessToken: accessToken ?? state.accessToken,
        })),

      setActiveRole: (role: StaffRole) =>
        set({
          activeRole: role,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          selectedSocietyId: null,
          selectedSociety: null,
          activeRole: null,
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
