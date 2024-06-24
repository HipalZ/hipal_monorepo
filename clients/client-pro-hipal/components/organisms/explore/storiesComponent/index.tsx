import Card from '@components/atoms/card'
import Loader from '@components/atoms/loader'
import Section from '@components/molecules/section'
import { _useAllBusiness } from '@components/store/useAllBusiness'
import { useStory } from '@components/store/useStory'
import { getRandomImg } from '@components/utils/images'
import { AnimatePresence, motion } from 'framer-motion'
import isEmpty from 'lodash-es/isEmpty'
import Image from 'next/legacy/image'
import { memo, useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'
import ReactInstaStories from 'react-insta-stories'

interface IStore {
	name: string
	image: string
	id: string
}

export default memo(function StoriesComponent() {
	const data = _useAllBusiness((s) => s.data)
	const setIsStoryOn = useStory((s) => s.setIsStoryOn)
	const isStoryOn = useStory((s) => s.isStoryOn)
	const [state, setState] = useState<{
		imageURl: string
		activeStories: string[]
		activeStoryId: string
		activeStory: number
	}>({
		imageURl: '',
		activeStories: [],
		activeStory: 0,
		activeStoryId: '',
	})

	useEffect(() => {
		setIsStoryOn(false)
	}, [])

	if (isEmpty(data?.settings?.explore?.highlights)) {
		return null
	}

	const handleClose = () => {
		setState({ ...state, activeStories: [], activeStoryId: '' })
		setIsStoryOn(false)
	}

	const stories = state.activeStories.map((imgUrl) => {
		let duration = 10000

		if (imgUrl.endsWith('.mp4')) {
			var video = document.createElement('video')
			video.preload = 'metadata'
			video.onloadedmetadata = function () {
				window.URL.revokeObjectURL(video.src)
				duration = video.duration * 1000
			}
			video.src = imgUrl
		}

		return {
			// type: `${imgUrl.includes('.mp4') ? 'video' : 'image'}`,
			duration: duration,
			content: ({ action, isPaused }) => {
				return (
					<Story action={action} isPaused={isPaused} imgUrl={imgUrl} handleClose={handleClose} />
				)
			},
		}
	})
	return (
		<Section title='Stories' tag='h3'>
			<div className='flex flex-row gap-4 -space-x-5 overflow-auto'>
				{(data?.settings?.explore?.highlights || []).map((story, key: number) => {
					if (
						story.stories?.length === 0 ||
						(story.stories?.length === 1 && !story.stories?.[0]) ||
						story.name == 'trail'
					)
						return null
					return (
						<motion.div
							layoutId={`${key}`}
							key={key}
							onClick={() => {
								setState({
									...state,
									activeStories: story?.stories || [],
									activeStoryId: `${key}`,
									activeStory: 0,
								})
								setIsStoryOn(true)
							}}
						>
							<Card src={story?.stories?.[0] || getRandomImg()} size={'md'}>
								{story?.name || ''}
							</Card>
						</motion.div>
					)
				})}
			</div>

			<AnimatePresence>
				{isStoryOn && (
					<motion.div
						layoutId={`${state.activeStoryId}`}
						className='fixed inset-0 z-50 w-screen h-screen bg-black'
					>
						<ReactInstaStories
							loop
							keyboardNavigation
							width={'100%'}
							height={'100%'}
							stories={stories}
							currentIndex={state.activeStory}
							storyContainerStyles={{ borderRadius: 8, overflow: 'hidden' }}
							onStoryEnd={(s, st) => {
								setState({
									...state,
									activeStory: state.activeStory + 1,
								})
							}}
							onAllStoriesEnd={(s, st) => {
								setState({
									...state,
									activeStories: [],
									activeStoryId: '',
									activeStory: 0,
								})
								setIsStoryOn(false)
							}}
							onStoryStart={(s, st) => {}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</Section>
	)
})

function Story({ action, isPaused, imgUrl, handleClose }) {
	useEffect(() => {
		action('pause')
	}, [])

	return (
		<div className='relative flex flex-col w-full h-full prose bg-black'>
			{imgUrl.includes('.mp4') ? (
				<div className='m-auto'>
					<video
						autoPlay
						style={{ width: 'max', height: 'max' }}
						onLoadStart={() => {
							action('pause')
						}}
						onCanPlay={() => {
							action('play')
						}}
					>
						<source src={imgUrl} />
					</video>
				</div>
			) : (
				<div className='w-full h-full'>
					<Image
						layout='fill'
						objectFit='contain'
						src={imgUrl}
						alt='story Image'
						onLoad={() => {
							action('play')
						}}
					/>
				</div>
			)}

			{isPaused && (
				<div className='absolute inset-0 flex flex-col items-center justify-center'>
					<Loader type='warning' isSquare />
				</div>
			)}

			<button
				className='btn btn-ghost rounded-full mx-auto z-[9999] flex flex-col bg-base-100/30 px-2 py-0 !h-8  !min-h-[2rem] absolute top-5 right-4'
				onClick={handleClose}
				title='Close'
			>
				<MdClose className='items-center my-0 text-lg text-white fill-current' />
				{/* <span className='text-xs text-white'>close</span> */}
			</button>
		</div>
	)
}
