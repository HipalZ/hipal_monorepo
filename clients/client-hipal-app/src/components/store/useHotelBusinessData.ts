import {create} from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { BusinessDetails } from "../types/businessData"

interface IUseHotelBusinessData {
    hotelData:BusinessDetails
    setHotelData:(data:BusinessDetails)=>void
}

export const useHotelBusinessData = create<IUseHotelBusinessData>()(
    persist(
        (set)=>({
            hotelData:{} as BusinessDetails,
            setHotelData:(d:BusinessDetails)=>set(()=>({hotelData:d}))
        }),
        {
            name:"hotelStore",
            storage:createJSONStorage(()=>localStorage)
        }
    )
)