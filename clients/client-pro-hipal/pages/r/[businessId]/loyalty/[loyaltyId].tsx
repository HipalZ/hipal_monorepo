import BackButton from '@components/atoms/backButton'
import React, { memo, useEffect, useState } from 'react'
import { useAllBusiness } from '@components/store/useAllBusiness'
import {
	beans,
	bowl,
	bud,
	flower,
	love,
	triangleToDataurl,
	waveToDataUrl,
} from '@components/atoms/card/pathPattern'
import wallet from '@assets/svg/wallet.svg'
import Image from 'next/image'
import { useRewardHistory } from '@components/store/useRewardHistory'
import type { UserData } from '@components/types/businessData'
import { useRouter } from 'next/router'
import useLoyaltyData from '@components/store/useLoyaltyData'

const LoyaltyId = () => {
	const { data: _data } = useAllBusiness()
	const router = useRouter()
	const { loyaltyId } = router.query as { loyaltyId: string }
	const items = useRewardHistory((s) => s.rewardHistory?.items)
	const [itemData, setItemData] = useState<UserData | undefined>(items)
	const [image, setImage] = useState<any>('')
	const [claimImage, setClaimImage] = useState('')
	const { loyaltySetting } = useLoyaltyData()
	const [cardPattern, setCardPattern] = useState('')
	const [cardColor, setCardColor] = useState('')
	const [fontColor, setFontColor] = useState('#FAE8CA')

	useEffect(() => {
		setItemData(items)
	}, [items, loyaltyId])

	useEffect(() => {
		setCardPattern(loyaltySetting?.cardPattern)
		setCardColor(loyaltySetting?.cardColor)
		setFontColor(loyaltySetting?.fontColor)
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
		setClaimImage(
			patterns(loyaltySetting?.cardPattern, _data?.settings?.themes?.secondaryColor.substring(1)),
		)
	}, [loyaltySetting, cardPattern, fontColor])
	
	return (
		<>
			<div className='relative flex flex-col w-full pb-16 mt-6 '>
				<div className='mx-6'>
					<BackButton />
					<h1 className='mt-5'>
						{_data?.businessesData?.businessName && (
							<span className='text-lg font-semibold capitalize text-base-content'>
								Rewards with {_data?.businessesData?.businessName}
							</span>
						)}
					</h1>
					{Array.isArray(itemData) &&
						itemData.map((item, index) => {
							return item.status === 'plus' ? (
								<div
									key={index}
									className={`${
										cardColor ? cardColor : 'bg-primary'
									} bg-cover bg-center h-[9rem] flex justify-between items-center px-6 text-white mt-5 w-full rounded-lg border border-1 border-primary`}
									style={{
										backgroundImage: `url(${image})`,
										backgroundColor: cardColor || 'primary',
										backgroundSize: `${
											cardPattern === 'beans' ||
											cardPattern === 'bowl' ||
											cardPattern === 'love' ||
											cardPattern === 'flower' ||
											cardPattern === 'bud'
												? '75px 50px'
												: 'cover'
										}`,
										backgroundPosition: `${
											cardPattern === 'beans' ||
											cardPattern === 'bowl' ||
											cardPattern === 'love' ||
											cardPattern === 'flower' ||
											cardPattern === 'bud'
												? 'right 25% top 50%'
												: ''
										}`,
										backgroundRepeat: 'no-repeat',
									}}
								>
									<div>
										<div className='flex items-center'>
											<Image src={wallet} alt='wallet' className='mr-4' />
											<h1
												style={{ color: `${fontColor}` }}
												className='flex flex-1 text-2xl font-semibold '
											>
												Yaay! coins
											</h1>
										</div>
										<div className='mt-3 mr-3'>
											<p style={{ color: `${fontColor}` }} className='text-sm leading-7'>
												for the visit at {item.businessName}
											</p>
											<p style={{ color: `${fontColor}` }} className='text-sm font-semibold'>
												{item.day}
											</p>
										</div>
									</div>
									<div className='flex self-center'>
										<p style={{ color: `${fontColor}` }} className='text-2xl font-semibold'>
											{item.rewards}
										</p>
									</div>
								</div>
							) : (
								<div
									key={index}
									style={{
										backgroundRepeat: 'no-repeat',
										backgroundImage: `url(${claimImage})`,
										backgroundSize: `${
											cardPattern === 'beans' ||
											cardPattern === 'bowl' ||
											cardPattern === 'love' ||
											cardPattern === 'flower' ||
											cardPattern === 'bud'
												? '75px 50px'
												: 'cover'
										}`,
										backgroundPosition: `${
											cardPattern === 'beans' ||
											cardPattern === 'bowl' ||
											cardPattern === 'love' ||
											cardPattern === 'flower' ||
											cardPattern === 'bud'
												? 'right 25% top 50%'
												: ''
										}`,
									}}
									className='flex items-center justify-between w-full p-6 mt-5 bg-no-repeat bg-auto border rounded-lg border-1 border-primary'
								>
									<div>
										<h1
											style={{ color: `${fontColor}` }}
											className='w-16 px-2 py-1 mb-3 rounded-md bg-primary text-base-100'
										>
											Saved
										</h1>
										<p className='text-base font-semibold text-primary'>{item.day}</p>
										<p className='text-base font-semibold leading-7 uppercase text-primary'>
											{item.businessName}
										</p>
										<p className='text-base text-primary'>
											used {item.currentBalance} coins by {item.userName}
										</p>
									</div>
									<div className='flex self-center'>
										<p className='text-base font-semibold text-primary'>-{item.rewards}</p>
									</div>
								</div>
							)
						})}
				</div>
			</div>
		</>
	)
}

export default memo(LoyaltyId)
