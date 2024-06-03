import { isEmpty } from 'lodash-es'
import { memo } from 'react'
import { AiOutlineStar } from 'react-icons/ai'
import { BsSunFill } from 'react-icons/bs'
import { MdLocalOffer } from 'react-icons/md'

function DishTag({
	tags,
}: {
	tags: {
		text: string
		color: string
		icon: string
	}[]
}) {
	const TAG_TYPES = {
		star_outline: {
			Icon: AiOutlineStar,
		},
		local_offer: {
			Icon: MdLocalOffer,
		},
		wb_sunny: {
			Icon: BsSunFill,
		},
	}

	const tag = tags?.[0]
	const Icon = TAG_TYPES?.[tag?.icon]?.Icon

	if (isEmpty(tags)) return null

	return (
		<>
			<div
				className={
					'px-3 rounded-[8px] text-primary text-[0.813rem]  leading-3 font-bold normal-case flex flex-row gap-2'
				}
				style={{ color: tag?.color || 'hsl(var(--bc))' }}
			>
				<Icon className='w-6 h-6 my-auto' />
				<span className='my-auto'>{tag.text}</span>
			</div>
		</>
	)
}

export default memo(DishTag)
