import { useLogin } from '@components/store/useLogin'
import useLoyaltyData from '@components/store/useLoyaltyData'
import React, { useEffect, useState } from 'react'
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from '../card/pathPattern'
import Image from 'next/image'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { useRouter } from 'next/router'

interface ILoyaltyCard {
	logo: string
	src: Record<string, any>
	cardColor: string
	fontColor: string
	hiCode?: string
}

const MainLoyalty = ({ logo, hiCode, cardColor, fontColor }: ILoyaltyCard) => {
	const [image, setImage] = useState<any>('')
	const { loyaltySetting } = useLoyaltyData()
	const [cardPattern, setCardPattern] = useState('')
	const [logos, setLogos] = useState<any>('')
	const userName = useLogin((s) => s.userDetails.name)
	const isLogin = useLogin((s) => s.isLogin)
	const setDirection = useLogin((s) => s.setDirection)
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	const goToLoyalty = (str: string) => {
		if (!isLogin) {
			setDirection(str)
			router.push(routePaths[PAGE_TYPES.SIGN_UP](businessId))
		} else {
			setDirection('')
			router.push(routePaths[PAGE_TYPES.LOYALTY](businessId))
		}
	}

	const handleClaimNowClick = () => {
		goToLoyalty('loyalty')
	}

	useEffect(() => {
		setLogos(loyaltySetting?.logo)
		setCardPattern(loyaltySetting?.cardPattern)
	}, [loyaltySetting])
	useEffect(() => {
		const patterns = (cardPattern, fontColor) => {
			const defaultColor = '#FAE8CA' // default font color

			// check if fontColor is available, else use default
			fontColor = fontColor || defaultColor

			const src = {
				wave: waveToDataUrl(fontColor, 'white').wave,
				triangle: triangleToDataurl('white').triangle,
				beans: beans(fontColor).beans,
				bud: bud(fontColor).bud,
				bowl: bowl(fontColor).bowl,
				love: love(fontColor).love,
				flower: flower(fontColor).flower,
			}
			// return the value from src object that corresponds to cardPattern key
			return src[cardPattern]
		}
		patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor)
		setImage(patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor))
	}, [loyaltySetting, cardPattern, fontColor])

	return (
		<div className='pt-2'>
			<div className='py-4 text-xl font-semibold text-center text-primary'>
				<div>Treat yourself to a</div>
				<div className='text-2xl text-accent'>{loyaltySetting?.setReward}% cashback</div>
				<div>with every bill you settle!!</div>
			</div>
			<div className='w-full py-4'>
				<div
					className='relative w-[85%] h-[25vh] m-auto bg-primary rounded-xl tilted-card'
					style={{
						backgroundImage: `url(${image})`,
						backgroundColor: cardColor,
						backgroundSize:
							cardPattern === 'beans' ||
							cardPattern === 'bowl' ||
							cardPattern === 'love' ||
							cardPattern === 'flower' ||
							cardPattern === 'bud'
								? '125px 125px'
								: 'cover',
						backgroundPosition:
							cardPattern === 'beans' ||
							cardPattern === 'bowl' ||
							cardPattern === 'love' ||
							cardPattern === 'flower' ||
							cardPattern === 'bud'
								? 'right 5% top 50%'
								: '',
						backgroundRepeat: 'no-repeat',
					}}
				>
					<h1
						style={{
							maxWidth: 'calc(100% - 2rem)',
							whiteSpace: 'nowrap',
							color: `${fontColor}`,
						}}
						className='absolute top-4 text-[0.5rem] ml-[1rem] font-semibold flex self-start'
					>
						<Image src={logo || logos} alt='logo' height={50} width={50} />
					</h1>
					{hiCode && (
						<div className='absolute text-2xl transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
							<div
								style={{
									color: `${fontColor}`,
								}}
							>
								{hiCode}
							</div>
						</div>
					)}
					<h1
						style={{
							maxWidth: 'calc(100% - 2rem)',
							whiteSpace: 'nowrap',
							color: `${fontColor}`,
						}}
						className='absolute flex self-start ml-5 text-sm font-normal bottom-4'
					>
						{userName ? userName : 'Name'}
					</h1>
				</div>
			</div>
			<div className='py-4 mx-6 text-sm text-center text-primary'>
				Get 5% cash back every time you Pay bill! It&#39;s our way of saying thanks for choosing us.
				Simple savings, just for you!
			</div>
			{!hiCode && (
				<div onClick={handleClaimNowClick} className='w-full px-4 pt-2 pb-4'>
					<button type='button' className='w-full py-3 rounded-full bg-primary text-primary-content'>
						Claim now
					</button>
				</div>
			)}
		</div>
	)
}

export default MainLoyalty