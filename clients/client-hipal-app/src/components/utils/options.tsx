import SkeletonLoader from "@/components/atoms/loader/skeletonLoader"

export const DYNAMIC_IMPORT_OPTIONS = {
	loading: () => <SkeletonLoader />,
	ssr: false,
	// suspense: true,
}
