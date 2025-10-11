import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

type AuthState = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const useAdminUpload = createWithEqualityFn<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: "admin-upload",
    },
  ),
);
