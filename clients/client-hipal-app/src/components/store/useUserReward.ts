import { create } from "zustand"
import { persist } from "zustand/middleware"

interface IUserReward {
	loyaltyId: string
	userPhone: string
	userName: string
	rewards: number
	password: number
	totalWin:number
	totalSave:number
}
interface IuserTotal {
    totalWin?: number;
    totalSave?: number;
    vipLevel?: string;
}


export const useUserReward = create(
	persist<{
		userReward: IUserReward
		setUserReward: (userReward: IUserReward) => void
		userTotalHistory:IuserTotal
		setUserTotalHistory: (userTotalHistory: IuserTotal) => void
	}>(
		(set, get) => ({
			userReward: {
				loyaltyId: "",
				userPhone: "",
				userName: "",
				rewards: 0,
				password: 0,
				totalWin:0,
				totalSave:0
			},
			setUserReward: (userReward: IUserReward) => set({ userReward: userReward }),
			userTotalHistory:{
				totalWin:0,
				totalSave:0,
			},
			setUserTotalHistory: (userTotalHistory: IuserTotal) => set({ userTotalHistory: userTotalHistory }),
		}),
		{
			name: "userReward",
			getStorage: () => localStorage,
		},
	),
)

export default useUserReward
