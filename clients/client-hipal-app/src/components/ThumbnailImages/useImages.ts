import { useGetBucketByBusinessId as useGetBucketByBusinessIdOriginal } from "@/components/hooks/useImages"

// Re-export the types for better tree-shaking
export type { Image, IBuckets, UseGetBucketById, BucketResponseById } from "@/components/hooks/useImages"

// Re-export the hook
export const useGetBucketByBusinessId = useGetBucketByBusinessIdOriginal
