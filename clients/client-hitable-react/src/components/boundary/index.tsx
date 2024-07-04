"use client";
import { type ReactNode, Suspense } from "react"

import { ErrorBoundary } from "react-error-boundary";
import SpinnerMemo from "../atoms/loadingSpinner";

const Boundary = ({children}:{children:ReactNode}) => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<SpinnerMemo />}>
          {children}
        </Suspense>
    </ErrorBoundary>
  )
}

export default Boundary