import { create } from "zustand";

export type LoyaltyPages = "GET_STARTED" | "CARD_SELECTION";

export type LoyaltyCardModalPages =
  | "SIGNUP_BONUS"
  | "COINZ_BACK"
  | "RESET_EXPIRY"
  | "TERMS&CONDITION"
  | "MAXIMUM_REDEMPTION"
  | "";

export type LoyaltyCardLayout = "LAYOUT_ONE" | "LAYOUT_TWO" | "LAYOUT_THREE";

export type SelectedCardType =
  | "CARD_ONE"
  | "CARD_TWO"
  | "CARD_THREE"
  | "CARD_FOUR"
  | "CARD_FIVE"
  | "CARD_SIX";

interface LoyaltyStore {

  loyaltyID: string;
  setLoyaltyID: (id: string) => void;

  selectedPage: LoyaltyPages;
  setSelectedPage: (page: LoyaltyPages) => void;

  changeModalLayout: LoyaltyCardModalPages;
  setChangeModalLayout: (page: LoyaltyCardModalPages) => void;

  selectedCardLayout: LoyaltyCardLayout;
  setSelectedCardLayout: (layout: LoyaltyCardLayout) => void;

  selectedCardType: SelectedCardType;
  setSelectedCardType: (type: SelectedCardType) => void;

  openModal: boolean;
  setOpenModal: (open: boolean) => void;

  signupBonus: number;
  setSignupBonus: (bonus: number) => void;

  coinzBack: number;
  setCoinzBack: (back: number) => void;

  resetExpiry: number;
  setResetExpiry: (expiry: number) => void;

  loyaltyStartDate: number;
  setLoyaltyStartDate: (date: number) => void;

  maxRedemption: number;
  setMaxRedemption: (redemption: number) => void;

  cardColor: string;
  setCardColor: (color: string) => void

  resetFields: () => void;
}

export const useLoyalty = create<LoyaltyStore>((set) => ({

  loyaltyID: "",
  setLoyaltyID: (id: string) => set(() => ({ loyaltyID: id })),

  selectedPage: "CARD_SELECTION",
  setSelectedPage: (page: LoyaltyPages) => set(() => ({ selectedPage: page })),

  changeModalLayout: "",
  setChangeModalLayout: (page: LoyaltyCardModalPages) =>
    set(() => ({ changeModalLayout: page })),

  selectedCardLayout: "LAYOUT_THREE",
  setSelectedCardLayout: (layout: LoyaltyCardLayout) =>
    set(() => ({ selectedCardLayout: layout })),

  selectedCardType: "CARD_ONE",
  setSelectedCardType: (type: SelectedCardType) =>
    set(() => ({ selectedCardType: type })),

  openModal: false,
  setOpenModal: (open: boolean) => set(() => ({ openModal: open })),

  signupBonus: 0,
  setSignupBonus: (bonus: number) => set(() => ({ signupBonus: bonus })),

  coinzBack: 0,
  setCoinzBack: (back: number) => set(() => ({ coinzBack: back })),

  resetExpiry: 0,
  setResetExpiry: (expiry: number) => set(() => ({ resetExpiry: expiry })),

  loyaltyStartDate: 0,
  setLoyaltyStartDate: (date: number) =>
    set(() => ({ loyaltyStartDate: date })),

  maxRedemption: 0,
  setMaxRedemption: (redemption: number) =>
    set(() => ({ maxRedemption: redemption })),

  resetFields: () =>
    set(() => ({
      signupBonus: 0,
      coinzBack: 0,
      resetExpiry: 0,
      maxRedemption: 0,
    })),
  cardColor: "",
  setCardColor: (color: string) => set(() => ({ cardColor: color })),
}));
