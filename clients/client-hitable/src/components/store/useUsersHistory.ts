import { create } from 'zustand';

export type IUserHistory = {
  userName: string;
  userPhone: number;
  rewards: number;
  time: string;
  status?: string;
};
export interface Item {
  name: string;
  quantity: number;
  amount: number;
  extras: any[];
  comments: string;
}

export interface UserHistory {
  userPhone: string;
  userName: string;
  rewards: number;
  currentBalance: number;
  status: string;
  date: string;
  time: string;
  businessName: string;
  waiterName: string;
  items: Item[];
  tableName: string;
  day: string;
  loyaltyId: string;
  total: number;
  subTotal: number;
  sgst: number;
  cgst: number;
  id: string;
}

export type ISingleUserHistory = {
  userPhone: string;
  totalReward: number;
  userName: string;
  items: UserHistory[];
};
type IUsers = {
  usersHistory: IUserHistory | any;
  setUsersHistory: (usersHistory: IUserHistory) => void;
  singleUserHistory: ISingleUserHistory | any;
  setSingleUserHistory: (singleUserHistory: ISingleUserHistory) => void;
};
export const useUsersHistory = create<IUsers>((set, get) => ({
  usersHistory: null,
  setUsersHistory: (usersHistory) => set({ usersHistory }),
  singleUserHistory: null,
  setSingleUserHistory: (singleUserHistory) => set({ singleUserHistory }),
}));
