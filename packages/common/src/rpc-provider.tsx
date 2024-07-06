import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { AppType } from '@hipal/server';
import { hc } from 'hono/client';
import type { ReactNode } from 'react';
import { handleCatchErrors } from './error-handler';

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
export const apiRpc = hc<AppType>('http://localhost:4500', {});
