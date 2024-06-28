"use client"
import BackButton from "@/components/atoms/backButton"
import PlaceholderImg from "@/components/atoms/placeholder"
import { useRoutingFlow } from "@/components/store/useRoutingFlow"
import { IThemes } from "@/components/types/businessData"
import { getRandomBlurImg } from "@/components/utils/images"
import { updateTheme } from "@/components/utils/themes"
import Image from "next/image"
import { memo, useEffect } from "react"

function TopBackground({ themes,halfTop = false }: { themes: IThemes | undefined ;halfTop?:boolean }) {
	const { getPreviousPath } = useRoutingFlow()
	const onBackURL = `${getPreviousPath()}`

	useEffect(() => {
		if (themes) {
			updateTheme(themes)
		}
	}, [themes])

	return (
		<div className={`relative ${halfTop ? "h-[10vh]":"h-[20vh]"}  w-full overflow-hidden`}>
			{themes?.miniBanner ? (
				<Image
					src={themes?.miniBanner || ""}
					width={700}
					height={300}
					quality={95}
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
