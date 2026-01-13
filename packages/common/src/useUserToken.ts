import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface userToken {
  accessToken: string;
  setAccessToken: (data: string) => void;
  refreshToken: string;
  setRefreshToken: (data: string) => void;
  validateToken: () => boolean;
}

export const useUserToken = create(
  persist<userToken>(
    (set, get) => ({
      accessToken: "",
      setAccessToken: (data: string) => {
        set({ accessToken: data });
      },
      refreshToken: "",
      setRefreshToken: (data: string) => {
        set({ refreshToken: data });
      },
      validateToken: () => {
        const { accessToken, refreshToken } = get();
        return accessToken.length > 0 && refreshToken.length > 0;
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
