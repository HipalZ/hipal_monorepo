import { create } from "zustand";
import { NavItemsHotelEnum, type RoomData } from "../types/hotelData";
import type { SortOption } from "../utils/helpersHotel";

interface IHotelStore {
  // nav items toggling
  selectedNavItem: NavItemsHotelEnum;
  setSelectedNavItem: (value: NavItemsHotelEnum) => void;
  // room data
  roomData: RoomData;
  setRoomData: (value: RoomData) => void;

  openRoomModal: boolean;
  setOpenRoomModal: (value: boolean) => void;

  guestName: string;
  setGuestName: (value: string) => void;

  phoneNumber: string;
  setPhoneNumber: (value: string) => void;

  reviewUserIds: string[];
  setReviewUserIds: (value: string[]) => void;
  toggleReviewUserId: (userId: string) => void;
  toggleAllReviewUserIds: () => void;

  openReviewModal: boolean;
  setOpenReviewModal: (value: boolean) => void;

  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;

  searchHistory: string;
  setSearchHistory: (value: string) => void;

  sortByHistory: SortOption;
  setSortByHistory: (value: SortOption) => void;

  hotelAlertsCount: number;
  setHotelAlertsCount: (value: number) => void;
}

export const useHotelStore = create<IHotelStore>((set) => ({
  selectedNavItem: NavItemsHotelEnum.Rooms,
  setSelectedNavItem: (value) => set({ selectedNavItem: value }),

  roomData: {} as RoomData,
  setRoomData: (value: RoomData) => set({ roomData: value }),

  openRoomModal: false,
  setOpenRoomModal: (value) => set({ openRoomModal: value }),

  guestName: "",
  setGuestName: (value) => set({ guestName: value }),

  phoneNumber: "",
  setPhoneNumber: (value) => set({ phoneNumber: value }),

  reviewUserIds: [],
  setReviewUserIds: (value) => set({ reviewUserIds: value }),

  // New toggle function for a single user ID
  toggleReviewUserId: (userId) =>
    set((state) => {
      if (state.reviewUserIds.includes(userId)) {
        return {
          reviewUserIds: state.reviewUserIds.filter((id) => id !== userId),
        };
      }
      return { reviewUserIds: [...state.reviewUserIds, userId] };
    }),

  // New toggle all function
  toggleAllReviewUserIds: () =>
    set((state) => {
      const allUserIds = state.roomData?.userIds?.map((user) => user._id) || [];
      if (state.reviewUserIds.length === allUserIds.length) {
        return { reviewUserIds: [] };
      }
      return { reviewUserIds: allUserIds };
    }),

  openReviewModal: false,
  setOpenReviewModal: (value) => set({ openReviewModal: value }),

  isFilterOpen: false,
  setIsFilterOpen: (value) => set({ isFilterOpen: value }),

  searchHistory: "",
  setSearchHistory: (value) => set({ searchHistory: value }),

  sortByHistory: "newest",
  setSortByHistory: (value) => set({ sortByHistory: value }),

  hotelAlertsCount: 0,
  setHotelAlertsCount: (value) => set({ hotelAlertsCount: value }),
}));
