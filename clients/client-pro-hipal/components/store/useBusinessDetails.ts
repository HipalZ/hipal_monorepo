import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type Staff = string

export interface IBusinessDetails {
	gstPercentage: number
	serviceCharge: boolean
	serviceChargePercentage: number
	businessName: string
	logo: string
	isPaymentIntegrated: boolean
}

export const useBusinessDetails = create(
	persist<{
		businessDetails: IBusinessDetails
		setBusinessDetails: (businessDetails: IBusinessDetails) => void
	}>(
		(set, get) => ({
			businessDetails: {
				businessName: '',
				logo: '',
				gstPercentage: 0,
				serviceCharge: false,
				serviceChargePercentage: 0,
				isPaymentIntegrated: false,
			},
			setBusinessDetails: (businessDetails: IBusinessDetails) =>
				set({ businessDetails: businessDetails }),
		}),
		{
			name: 'useBusinessDetails',
		},
	),
)

export default useBusinessDetails
