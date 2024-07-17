import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface ILoyaltySetting {
    loyaltyId: string
    expiryDate: string
	businessId: string
	_id: string
	cardColor: string
	fontColor: string
	cardPattern: any
	setCashBackPercentage: number
	setClaimRewards: number
	logo?: string
	signUpBonus: number
	rewardLimit:number
}

export const useLoyaltyData = create(
	persist<{
		loyaltySetting: ILoyaltySetting
		setLoyaltySetting: (loyaltySetting: ILoyaltySetting) => void
	}>(
		(set) => ({
			loyaltySetting: {
				loyaltyId: "",
				businessId: "",
				setCashBackPercentage: 10,
				setClaimRewards: 20,
				_id: "",
				cardPattern: "",
				cardColor: "",
				fontColor: "",
				logo: "",
				signUpBonus: 0,
				expiryDate: "",
				rewardLimit: 0,
			},
			setLoyaltySetting: (loyaltySetting: ILoyaltySetting) =>
				set({ loyaltySetting: loyaltySetting }),
		}),
		{
			name: "userLoyaltyData",
			storage:createJSONStorage(()=>localStorage)
		},
	),
)

export default useLoyaltyData
