import type { AppType } from '@hipal/server';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hc } from 'hono/client';
import type { ReactNode } from 'react';
import { handleCatchErrors } from './error-handler';
import { useUserToken } from './useTokenStore';

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

const useApiRpc = () => {
  const accessToken = useUserToken.getState().accessToken;
  const refreshToken = useUserToken.getState().refreshToken;
  return hc<AppType>('http://localhost:4500', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-refresh-token': refreshToken,
    },
  });
};

export { useApiRpc };
