import axios from '@utils/axios'
import { toast } from 'react-toastify'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IUseLogin {
	phoneNumber: string
	name: string
	email: string
	userDetails: {
		name?: string
		email?: string
		phone?: string
		role?: string
		id?: string
		userDiscription?: string
	}
	isLogin?: boolean
	showLogin: boolean
	activeAuthPromptType: string
	hiCode: string
	errorMsg: string
	role: {
		role?: string
		customerName?: string
		customerPhone?: string
	}
	direction: string

	setPhoneNumber: (d: string) => void
	setName: (d: string) => void
	setEmail: (d: string) => void
	setUserDetails: (d: any) => void
	setRole: (d: any) => void
	setIsLogin: (d: boolean) => void
	setShowLogin: (d: boolean) => void
	setActiveAuthPromptType: (d: string) => void
	setHiCode: (d: string) => void
	setErrorMsg: (d: string) => void
	setDirection: (d: string) => void
	isLoginCred: () => boolean
	sendOtp: () => Promise<any>
}

export const PROMPT_TYPES = {
	LOGIN: 'login',
	SIGNUP: 'signup',
	OTP: 'otp',
	HI_CODE: 'hiCode',
}

export const useLogin = create(
	persist<IUseLogin>(
		(set, get) => ({
			phoneNumber: '',
			name: '',
			email: '',
			userDetails: {},
			isLogin: false,
			showLogin: false,
			hiCode: '',
			errorMsg: '',
			activeAuthPromptType: PROMPT_TYPES.LOGIN,
			role: {},
			direction: '',

			setPhoneNumber: (d: string) => set({ phoneNumber: d }),
			setName: (d: string) => set({ name: d }),
			setEmail: (d: string) => set({ email: d }),
			setUserDetails: (d: any) => set({ userDetails: d }),
			setRole: (d: any) => set({ role: d }),
			setIsLogin: (d: boolean) => set({ isLogin: d }),
			setShowLogin: (d: boolean) => set({ showLogin: d }),
			setHiCode: (d: string) => set({ hiCode: d }),
			setErrorMsg: (d: string) => set({ errorMsg: d }),
			setActiveAuthPromptType: (d: string) => set({ activeAuthPromptType: d }),
			setDirection: (d: string) => set({ direction: d }),

			isLoginCred: () =>
				get()?.phoneNumber?.length === 10 && get()?.name?.length > 0 && get()?.email?.length > 0,

			sendOtp: async () => {
				toast.success('otp send sucessfully')
				let config = {
					method: 'POST',
					url: '/v1/users/otp?clientRole=user',
					data: {
						phone: `${get().phoneNumber}`,
					},
				}
				return await axios(config)
			},
		}),
		{
			name: 'useLogin',
		},
	),
)
