import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { AppType } from '@hipal/server';
import { hc } from 'hono/client';
import type { ReactNode } from 'react';
import { handleCatchErrors } from './error-handler';
import { useUserToken } from './useUserToken';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => handleCatchErrors(err),
  }),
  mutationCache: new MutationCache({
    onError: (err) => handleCatchErrors(err),
  }),
});

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  throw new Error('API URL is not defined');
};

const baseUrl = getBaseUrl();

console.log('baseUrl', baseUrl);

export const apiRpc = hc<AppType>(baseUrl, {
  headers: () => ({
    Authorization: `Bearer ${useUserToken.getState().accessToken}`,
    'x-refresh-token': useUserToken.getState().refreshToken,
  }),
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }), // Force fetch to include cookies
});
