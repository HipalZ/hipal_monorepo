import axios from "@/utils/axios"
import { toast } from "react-toastify"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface IUserData {
	name?: string
	email?: string
	phone: string
	role: string[]
	userDescription?: string
	reward?: number
	count?: number
	_id: string
}
interface IRole {
	role: string
	customerName: string
	customerPhone: string
}

interface IUseLogin {
	userDetails: IUserData
	isLogin?: boolean
	hiCode: string
	errorMsg: string
	direction: string
	role: IRole
	fromPage: string,
	isPayment: boolean
	userCoinZ: number
	setUserDetails: (d: IUserData) => void
	setRole: (d: IRole) => void
	setIsLogin: (d: boolean) => void
	setHiCode: (d: string) => void
	setErrorMsg: (d: string) => void
	setDirection: (d: string) => void
	setFromPage: (d: string) => void
	isLoginCred: () => boolean
	sendOtp: () => Promise<any>
	setIsPayment: (d: boolean) => void
	setUserCoinZ: (d: number) => void
}

export const useLogin = create(
	persist<IUseLogin>(
		(set, get) => ({
			userDetails: {
				id: "",
				count: 0,
				email: "",
				name: "",
				phone: "",
				reward: 0,
				role: [],
				userDescription: "",
				_id: "",
			},
			isLogin: false,
			showLogin: false,
			hiCode: "",
			errorMsg: "",
			role: {
				role: "",
				customerName: "",
				customerPhone: "",
			},
			direction: "",
			fromPage: '',
			isPayment: false,
			userCoinZ: 0,
			setUserDetails: (d: IUserData) => set({ userDetails: d }),
			setIsLogin: (d: boolean) => set({ isLogin: d }),
			setHiCode: (d: string) => set({ hiCode: d }),
			setErrorMsg: (d: string) => set({ errorMsg: d }),
			setDirection: (d: string) => set({ direction: d }),
			setFromPage: (d: string) => set({ fromPage: d }),
			setRole: (d: IRole) => set({ role: d }),
			setIsPayment: (d: boolean) => set({ isPayment: d }),
			setUserCoinZ: (d: number) => set({ userCoinZ: d }),
			isLoginCred: () => get()?.userDetails.phone?.length === 10,
			sendOtp: async () => {
				toast.success("otp send successfully")
				const config = {
					method: "POST",
					url: "/v1/users/otp?clientRole=user",
					data: {
						phone: `${get().userDetails.phone}`,
					},
				}
				return await axios(config)
			},
		}),
		{
			name: "useLogin",
			storage:createJSONStorage(()=>localStorage)
		},
	),
)
