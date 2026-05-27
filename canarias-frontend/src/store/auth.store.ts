import { create } from "zustand";

interface User {
  sub: string;
  email: string;
  role: string;
  societyId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

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
}));
