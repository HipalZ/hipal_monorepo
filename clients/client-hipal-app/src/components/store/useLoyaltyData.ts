import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ILoyaltySetting {
    loyaltyId: string
    expiryDate: string
	businessId: string
	_id: string
	cardColor: string
	fontColor: string
	cardPattern: any
	setReward: number
	setClaimAmount: number
	logo?: string
	signUpBonus: number
}

export const useLoyaltyData = create(
	persist<{
		loyaltySetting: ILoyaltySetting
		setLoyaltySetting: (loyaltySetting: ILoyaltySetting) => void
	}>(
		(set, get) => ({
			loyaltySetting: {
				loyaltyId: "",
				businessId: "",
				setReward: 10,
				setClaimAmount: 20,
				_id: "",
				cardPattern: "",
				cardColor: "",
				fontColor: "",
				logo: "",
				signUpBonus: 0,
				expiryDate: "",
			},
			setLoyaltySetting: (loyaltySetting: ILoyaltySetting) =>
				set({ loyaltySetting: loyaltySetting }),
		}),
		{
			name: "userLoyaltyData",
		},
	),
)

export default useLoyaltyData
