"use client";
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { type ReactNode, Suspense } from "react"

import { ErrorBoundary } from "react-error-boundary";

const Boundary = ({children}:{children:ReactNode}) => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
    </ErrorBoundary>
  )
}

export default Boundary