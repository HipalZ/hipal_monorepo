import { _useAllBusiness } from "@components/store/useAllBusiness"
import { getRandomBlurImg } from "@components/utils/images"
import isEmpty from "lodash-es/isEmpty"
import Image from "next/legacy/image"
import { memo, useMemo } from "react"

function PageName() {
	const data = _useAllBusiness((s) => s.data)

	const endBanner = useMemo(
		() => data?.settings?.themes?.endBanner || "",
		[data?.settings?.themes?.endBanner],
	)

	if (isEmpty(endBanner)) {
		return null
	}

	return (
		<div className=" mb-4 bg-base-300 relative flex flex-col h-[50vh]">
			<Image
				src={endBanner}
				quality={75}
				width={100}
				height={100}
				alt={"background"}
				layout="fill"
				objectFit="cover"
				// className='z-10 w-full h-full aspect-square'
				placeholder="blur"
				blurDataURL={getRandomBlurImg(100, 100)}
			/>
		</div>
	)
}

export default memo(PageName)
