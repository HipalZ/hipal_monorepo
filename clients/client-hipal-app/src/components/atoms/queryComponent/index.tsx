"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

interface QueryComponentProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

const QueryComponent = ({ children }: QueryComponentProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryComponent;
