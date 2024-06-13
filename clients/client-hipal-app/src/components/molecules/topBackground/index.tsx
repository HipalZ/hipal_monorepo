import BackButton from "@/components/atoms/backButton"
import PlaceholderImg from "@/components/atoms/placeholder"
import { getRandomBlurImg } from "@/components/utils/images"
import Image from "next/image"
import { memo } from "react"

function TopBackground({ onBackURL,miniBanner }: { onBackURL: string,miniBanner:string }) {
	return (
		<div className="relative h-[20vh] w-full overflow-hidden ">
			{miniBanner ? (
				<Image
					src={miniBanner || ""}
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
				<PlaceholderImg className="w-full h-full" />
			)}
			<div className="top-4  w-full absolute z-[60] flex flex-row px-4">
				<BackButton onBackURL={onBackURL} />
			</div>
		</div>
	)
}

export default memo(TopBackground)
