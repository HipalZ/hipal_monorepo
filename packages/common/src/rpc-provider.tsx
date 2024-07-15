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
const { accessToken, refreshToken } = useUserToken.getState();
console.log('accessToken', accessToken);
console.log('refreshToken', refreshToken);
export const apiRpc = hc<AppType>(Bun.env.BASE_URL, {});
