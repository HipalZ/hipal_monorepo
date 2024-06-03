import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IUserReward {
	loyaltyId: string
	userPhone: string
	userName: string
	rewards: number
	password: number
}

export const useUserReward = create(
	persist<{
		userReward: IUserReward
		setUserReward: (userReward: IUserReward) => void
	}>(
		(set, get) => ({
			userReward: {
				loyaltyId: '',
				userPhone: '',
				userName: '',
				rewards: 0,
				password: 0,
			},
			setUserReward: (userReward: IUserReward) => set({ userReward: userReward }),
		}),
		{
			name: 'userReward',
		},
	),
)

export default useUserReward
