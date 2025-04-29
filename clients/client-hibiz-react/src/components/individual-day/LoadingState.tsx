import { memo } from "react"
import MemoizedHeader from "@/components/molecules/header"

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Day Details" />
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="border-primary mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-gray-500">Loading day information...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(LoadingState)
