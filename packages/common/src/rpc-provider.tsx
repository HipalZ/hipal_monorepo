import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import type { AppType } from "@hipal/server";
import { hc } from "hono/client";
import type { ReactNode } from "react";
import { handleCatchErrors } from "./error-handler";
import { useUserToken } from "./useUserToken";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => handleCatchErrors(err),
  }),
  mutationCache: new MutationCache({
    onError: (err) => handleCatchErrors(err),
  }),
});

export const RpcProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
const accessToken = useUserToken.getState().accessToken;
const refreshToken = useUserToken.getState().refreshToken;

export const apiRpc = hc<AppType>("https://api.test.hipalz.com", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "x-refresh-token": refreshToken,
  },
});
