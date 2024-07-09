// store/useUserToken.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface userToken {
  accessToken: string;
  setAccessToken: (data: string) => void;
  refreshToken: string;
  setRefreshToken: (data: string) => void;
}

export const useUserToken = create(
  persist<userToken>(
    (set) => ({
      accessToken: "",
      setAccessToken: (data: string) => {
        set({ accessToken: data });
      },
      refreshToken: "",
      setRefreshToken: (data: string) => {
        set({ refreshToken: data });
      },
    }),
    {
      name: "HiBiz-token-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
