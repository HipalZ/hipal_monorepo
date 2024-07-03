"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, memo } from "react";

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

const MemoQueryComponent = memo(QueryComponent);
export default MemoQueryComponent;
