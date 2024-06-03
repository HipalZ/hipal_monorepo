import { getRandomBlurImg } from '@components/utils/images'
import Image from 'next/legacy/image'
import { memo } from 'react'
import PlaceholderImg from '../placeholder/img'

export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
	size: 'sm' | 'md' | 'lg'
	src: string
	appendCardClassNames?: string
	appendTextClassNames?: string
	innerContentTop?: boolean
	isOuterContent?: boolean
	children: React.ReactNode
}

function Card({
	size,
	src,
	innerContentTop,
	isOuterContent,
	appendCardClassNames,
	appendTextClassNames,
	children,
	...props
}: ICard) {
	const innerContentTopClass = innerContentTop
		? ' top-0 bg-gradient-to-t to-black via-transparent from-transparent '
		: ' bottom-0 bg-gradient-to-t from-black  via-transparent to-transparent  '

	const defaultClasses = {
		mainCard:
			'btn btn-lg btn-ghost snap-center mt-auto py-1 prose relative overflow-hidden rounded-xl shadow mt-2 mb-6 flex flex-col bg-base-100 border-0 capitalize',
		imageSize: '',
		innerContent: ` px-3 w-full absolute inset-x-0 rounded-md ${
			innerContentTop ? 'flex-col' : 'flex-row'
		} ${innerContentTopClass} capitalize font-normal truncate text-white flex  text-sm overflow-hidden `,
		outerContent: 'w-full z-10 flex flex-row bg-base-200',
	}

	const classes = {
		sm: {
			mainCard: 'w-14 aspect-square m-3.5 ',
			imageSize: '',
			innerContent: ' !h-3/5 px-1.5 py-1 !text-xs items-end',
			outerContent: '',
		},
		md: {
			mainCard: 'w-[8rem] max-w-[89%] aspect-square h-[10.5rem] flex m-3.5 mx-2',
			imageSize: '',
			innerContent: 'p-3 flex flex-wrap gap-x-0.5 gap-y-0 ',
			outerContent: '',
		},
		lg: {
			mainCard: 'w-[19rem] min-w-[90%] h-[13rem] mx-auto ',
			imageSize: '',
			innerContent: `p-3 !h-full ${innerContentTop ? 'items-start' : 'items-end'}  !text-xs`,
			outerContent: 'px-3 py-1 bg-base-200',
		},
	}

	return (
		<button
			className={`${defaultClasses.mainCard} ${classes[size].mainCard} ${appendCardClassNames}`}
			{...props}
		>
			<div className={`${defaultClasses.imageSize} ${classes[size].imageSize} `}>
				{src?.length > 0 ? (
					<Image
						src={src}
						quality={95}
						layout='fill'
						width={320}
						height={320}
						objectFit='cover'
						className='object-center bg-center'
						alt={src}
						placeholder='blur'
						blurDataURL={getRandomBlurImg(100, 100)}
					/>
				) : (
					<>
						<PlaceholderImg />
					</>
				)}
			</div>

			{!isOuterContent ? (
				<>
					<div
						className={`${defaultClasses.innerContent} ${classes[size].innerContent} ${appendTextClassNames}`}
					>
						{children}
					</div>
				</>
			) : (
				<>
					<div
						className={`${defaultClasses.outerContent} ${classes[size].outerContent} ${appendTextClassNames}`}
					>
						{children}
					</div>
				</>
			)}
		</button>
	)
}

export default memo(Card)
