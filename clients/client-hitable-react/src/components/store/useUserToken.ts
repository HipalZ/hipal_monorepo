import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface IuserToken {
  accessToken: string;
  setAccessToken: (data: string) => void;
  refreshToken: string;
  setRefreshToken: (data: string) => void;
}

export const useUserToken = create(
  persist<IuserToken>(
    (set) => ({
      accessToken: '',
      setAccessToken: (data: string) => {
        set({ accessToken: data });
      },
      refreshToken: '',
      setRefreshToken: (data: string) => {
        set({ refreshToken: data });
      },
    }),
    {
      name: 'token-data',
      getStorage: () => localStorage,
    },
  ),
);