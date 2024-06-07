import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ILoyaltySetting {
	businessId: string
	loyaltyId: string
	cardColor: string
	fontColor: string
	cardPattern: any
	setReward: number
	setClaimAmount: number
	logo?: string
	signUpBonus: number,
}

export const useLoyaltyData = create(
	persist<{
		loyaltySetting: ILoyaltySetting
		setLoyaltySetting: (loyaltySetting: ILoyaltySetting) => void
	}>(
		(set, get) => ({
			loyaltySetting: {
				businessId: '',
				setReward: 10,
				setClaimAmount: 20,
				loyaltyId: '',
				cardPattern: '',
				cardColor: '',
				fontColor: '',
				logo: '',
				signUpBonus: 0,
			},
			setLoyaltySetting: (loyaltySetting: ILoyaltySetting) =>
				set({ loyaltySetting: loyaltySetting }),
		}),
		{
			name: 'userLoyaltyData',
		},
	),
)

export default useLoyaltyData
