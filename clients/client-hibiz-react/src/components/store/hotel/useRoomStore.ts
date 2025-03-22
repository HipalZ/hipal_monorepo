import { create } from "zustand";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import type { IAmenity } from "@/hooks/hotel/useAmenities";
import type { IRoomType } from "@/hooks/hotel/useRoomTypeHook";

interface Room {

    roomType: IRoomType[]
    setRoomType: (data: IRoomType[]) => void

    roomData: IHotelRoom[]
    setRoomData: (data: IHotelRoom[]) => void

    amenitiesData: IAmenity[]
    setAmenitiesData: (data: IAmenity[]) => void

    openAddRoomModal: boolean
    setOpenAddRoomModal: (status: boolean) => void
}

export const useRoomStore = create<Room>((set) => ({
    roomType: [] ,
    setRoomType: (data: IRoomType[]) => set({ roomType: data }),
    
    roomData: [],
    setRoomData: (data: IHotelRoom[]) => set({ roomData: data }),

    amenitiesData: [],
    setAmenitiesData: (data: IAmenity[]) => set({ amenitiesData: data }),

    openAddRoomModal: false,
    setOpenAddRoomModal: (status: boolean) => set({ openAddRoomModal: status })
}))

