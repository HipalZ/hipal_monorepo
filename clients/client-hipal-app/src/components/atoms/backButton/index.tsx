import { useRouter } from "next/navigation"
import { memo, useEffect } from "react"
import { MdOutlineChevronLeft } from "react-icons/md"

interface BackButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	/**
	 * The URL to go back to
	 */
	onBackURL?: string
}

function BackButton({ onBackURL, ...props }: BackButtonProps) {
	const router = useRouter()

	const onBack = () => {
		if (onBackURL) {
			router.push(onBackURL)
		} else {
			router.back()
		}
	}

	useEffect(() => {
		if (onBackURL) {
			router.prefetch(onBackURL)
		}
	}, [])

	return (
		<button
			className="flex flex-row w-10 h-10 mr-auto rounded-full bg-black/40 on_active_bounce"
			onClick={onBack}
			{...props}
		>
			<div className="flex flex-row m-auto">
				<MdOutlineChevronLeft className="text-3xl text-white " />
			</div>
		</button>
	)
}

const MemoBackButton = memo(BackButton)
export default memo(MemoBackButton)
