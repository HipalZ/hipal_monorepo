import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface IAmenity {
    _id: string,
    name: string,
    image: string,
}

export const useGetAllAmenitiesOfHotel = () => {

    const { setAmenitiesData } = useRoomStore(s => ({
        setAmenitiesData: s.setAmenitiesData
    }))

    const allAmenities = async () =>{
        const response = await apiRpc.hotel.amenities.fetch_hotel_amenities.$get()
        const result = await response.json();
        const amenities = result.data ?? [];
        setAmenitiesData(amenities)
        return amenities;
    }

    const { isLoading:amenityLoader, data: amenitiesData, refetch } = useQuery({
        queryKey: ["getAllAmenitiesOfHotel"],
        queryFn: allAmenities,
    })

    return { amenityLoader, amenitiesData, refetch }
}