import { UserData } from "@/components/types/businessData"
import { create } from "zustand"

interface IUserRewardData {
	totalReward?: number
	userName?: string
	tableName?: string
	day?: string
	loyaltyId?: string
	items: UserData
}

interface IuserRewardHistoryState {
	rewardHistory: IUserRewardData
	setRewardHistory: (rewardHistory: IUserRewardData) => void
}

export const useRewardHistory = create<IuserRewardHistoryState>((set) => ({
	rewardHistory: {
		items: {
			userPhone: "",
			userName: "",
			rewards: 0,
			currentBalance: 0,
			status: "",
			date: 0,
			time: "",
			businessName: "",
			waiterName: "",
			items: [],
			tableName: "",
			day: "",
			loyaltyId: "",
			id: "",
			_id: "",
		},
	},
	setRewardHistory: (rewardHistory: IUserRewardData) => set({ rewardHistory }),
}))
