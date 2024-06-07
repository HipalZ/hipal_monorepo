import BottomButton from '@components/molecules/bottomButton'
import { useRoutingFlow } from '@components/store/useRoutingFlow'
import Link from 'next/link'
import { memo } from 'react'

function ExploreBottomButton() {
	const { getNextPath } = useRoutingFlow()
	const exploreBtnText = () => {
		return 'Menu'
	}

	const getLink = () => {
		return getNextPath()
	}

	const PrimaryButtonWrapper = ({ children }: { children: React.ReactNode }) => {
		if (!getLink()) {
			return <BottomButton>{children}</BottomButton>
		}

		return (
			<Link href={`${getLink()}`} passHref>
				<BottomButton>{children}</BottomButton>
			</Link>
		)
	}

	return (
		<PrimaryButtonWrapper>
			<div className='flex flex-row space-x-2 capitalize'>
				<span className='my-auto'>{exploreBtnText()}</span>
			</div>
		</PrimaryButtonWrapper>
	)
}

export default memo(ExploreBottomButton)
