import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ILoyaltySetting {
	loyaltyId: string
	cardColor: string
	fontColor: string
	cardPattern: any
	setReward: number
	setClaimAmount: number
	logo?: string
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
