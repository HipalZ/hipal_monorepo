import axios from '@utils/axios'
import { toast } from 'react-toastify'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface IUserData {
	name?: string
	email?: string
	phone: string
	role: string
	id: string
	userDescription?: string;
	reward?: number;
	count?: number;
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

	setUserDetails: (d: IUserData) => void
	setRole: (d: IRole) => void
	setIsLogin: (d: boolean) => void
	setHiCode: (d: string) => void
	setErrorMsg: (d: string) => void
	setDirection: (d: string) => void
	isLoginCred: () => boolean
	sendOtp: () => Promise<any>
}



export const useLogin = create(
	persist<IUseLogin>(
		(set, get) => ({
			userDetails: {
				id: '',
				count: 0,
				email: '',
				name: '',
				phone: '',
				reward: 0,
				role: '',
				userDescription: '',

			},
			isLogin: false,
			showLogin: false,
			hiCode: '',
			errorMsg: '',
			role: {
				role: '',
				customerName: '',
				customerPhone: '',
			},
			direction: '',

			setUserDetails: (d: IUserData) => set({ userDetails: d }),
			setIsLogin: (d: boolean) => set({ isLogin: d }),
			setHiCode: (d: string) => set({ hiCode: d }),
			setErrorMsg: (d: string) => set({ errorMsg: d }),
			setDirection: (d: string) => set({ direction: d }),
			setRole: (d: IRole) => set({ role: d }),

			isLoginCred: () =>
				get()?.userDetails.phone?.length === 10,

			sendOtp: async () => {
				toast.success('otp send successfully')
				let config = {
					method: 'POST',
					url: '/v1/users/otp?clientRole=user',
					data: {
						phone: `${get().userDetails.phone}`,
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
