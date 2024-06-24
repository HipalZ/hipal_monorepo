import BackButton from "@components/atoms/backButton"
import PlaceholderImg from "@components/atoms/placeholder"
import { _useAllBusiness } from "@components/store/useAllBusiness"
import { useRoutingFlow } from "@components/store/useRoutingFlow"
import { getRandomBlurImg } from "@components/utils/images"
import Image from "next/legacy/image"
import { memo } from "react"

function TopBackground({ onBackURL }: { onBackURL: string }) {
	const data = _useAllBusiness((s) => s.data)
	const { getPreviousPath } = useRoutingFlow()

	return (
		<div className="relative h-[20vh] w-full overflow-hidden ">
			{data?.settings?.themes?.miniBanner ? (
				<Image
					src={data?.settings?.themes?.miniBanner || ""}
					width={700}
					height={300}
					quality={75}
					objectFit="cover"
					className="mx-auto"
					alt={"miniBanner Image"}
					placeholder="blur"
					blurDataURL={getRandomBlurImg(700, 700)}
				/>
			) : (
				<>
					<PlaceholderImg className="w-full h-full" />
				</>
			)}
			<div className="top-4  w-full absolute z-[60] flex flex-row px-4">
				<BackButton onBackURL={getPreviousPath()} />
			</div>
		</div>
	)
}

export default memo(TopBackground)
