import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IBusinessDetails {
	businessName: string | any
	logo: string | any
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
