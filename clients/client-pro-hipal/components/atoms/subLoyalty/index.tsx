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
import TitleTransition from '../titletransition'
import useBusinessDetails from '@components/store/useBusinessDetails'

interface ILoyaltyCard {
	logo: string
	src: Record<string, any>
	cardColor: string
	fontColor: string
}

const SubLoyalty = ({ logo, src, cardColor, fontColor }: ILoyaltyCard) => {
	const [image, setImage] = useState<any>('')
	const { loyaltySetting } = useLoyaltyData()
	const [cardPattern, setCardPattern] = useState('')
	const [logos, setLogos] = useState<any>('')
	const businessDetails = useBusinessDetails((s) => s.businessDetails.businessName)

	useEffect(() => {
		setLogos(loyaltySetting?.logo)
		setCardPattern(loyaltySetting?.cardPattern)
	}, [loyaltySetting])
	useEffect(() => {
		const patterns = (cardPattern, fontColor) => {
			const defaultColor = '#FAE8CA'

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
			return src[cardPattern]
		}
		patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor)
		setImage(patterns(loyaltySetting?.cardPattern, loyaltySetting?.fontColor))
	}, [loyaltySetting, cardPattern, fontColor])

	return (
		<div className='flex items-center justify-between'>
			<div className='text-base w-[60%] font-semibold text-primary'>
				<div>Treat yourself to a</div>
				<TitleTransition loyaltySetting={loyaltySetting} data={businessDetails} />
				<div>with every bill you settle!!</div>
			</div>
			<div className='w-[30%] -mr-4'>
				<div
					className={`${cardColor ?cardColor:'bg-primary'} rounded-md`}
					style={{
                        height:'65px',
                        width:'80px',
						backgroundImage: `url(${image})`,
						backgroundColor: cardColor || 'primary',
						backgroundSize:
							cardPattern === 'beans' ||
							cardPattern === 'bowl' ||
							cardPattern === 'love' ||
							cardPattern === 'flower' ||
							cardPattern === 'bud'
								? '25px 25px'
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
                        transform: 'skewX(10deg) skewY(10deg) rotateZ(45deg)',
					}}
				>
					<h1
						style={{
							maxWidth: 'calc(100% - 2rem)',
							whiteSpace: 'nowrap',
							color: `${fontColor}`,
						}}
						className='text-[0.5rem] ml-[1rem] font-semibold flex self-start'
					>
						<Image src={logos || logo} alt='logo' height={20} width={20} />
					</h1>

				</div>
			</div>
		</div>
	)
}

export default SubLoyalty