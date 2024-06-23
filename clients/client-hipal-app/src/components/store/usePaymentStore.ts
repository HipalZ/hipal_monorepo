import { create } from "zustand"

interface IUsePaymentStore {
    claimedCoinz: number
    setClaimedCoinz: (coinz: number) => void
    tips: number
    setTips: (tips: number) => void
    userCoinz: number
    setUserCoinz: (coinz: number) => void
    total: number
    setTotal: (total: number) => void
    billValue: number
    setBillValue: (value: number) => void
}

export const usePaymentStore = create<IUsePaymentStore>((set) => ({

    claimedCoinz: 0,
    setClaimedCoinz: (coinz: number) => set(() => ({ claimedCoinz: coinz })),

    tips: 0,
    setTips: (tips: number) => set(() => ({ tips: tips })),

    userCoinz: 0,
    setUserCoinz: (coinz: number) => set(() => ({ userCoinz: coinz })),

    total: 0,
    setTotal: (total: number) => set(() => ({ total: total })),

    billValue: 0,
    setBillValue: (value: number) => set(() => ({ billValue: value })),

}))
