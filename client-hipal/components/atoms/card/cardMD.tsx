import { memo } from 'react'
import { MdExplore } from 'react-icons/md'
import Card, { ICard } from '.'

interface ICardMD {
	src: string
	text: string
	noExplore?: boolean
	size?: 'sm' | 'md' | 'lg'
}

function CardMD({ src, text, noExplore, ...props }: ICardMD | (ICardMD & ICard)) {
	return (
		<>
			<Card src={src} size={'md'} appendCardClassNames='relative' {...props}><></></Card>
			<div className='flex flex-row w-20rem pl-[0.60rem] -mt-6 mb-4 py-1'>
				<span className='inline-block text-lg font-normal tracking-wider capitalize truncate align-top'>
					{text}
				</span>
			</div>
			{!noExplore && (
				<div className='flex flex-row px-2 mt-auto ml-auto space-x-1 rounded-full 2 btn btn-sm btn-primary -py-2'>
					<MdExplore className='my-auto text-lg' />
					<span className='right-2 text-sm pr-1 my-auto pt-0.5  font-light tracking-wider capitalize'>
						Explore
					</span>
				</div>
			)}
			<div></div>
		</>
	)
}

export default memo(CardMD)
