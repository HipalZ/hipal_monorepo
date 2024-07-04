import { createWithEqualityFn } from 'zustand/traditional';
import {shallow} from 'zustand/shallow';
import { persist } from 'zustand/middleware';

interface IuserToken {
  accessToken: string;
  setAccessToken: (data: string) => void;
  refreshToken: string;
  setRefreshToken: (data: string) => void;
}

const useShallowToken = createWithEqualityFn(
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
  ),shallow
);

export const useUserToken = <T>(selector: (state: IuserToken) => T) => {
  return useShallowToken(selector, shallow)
}