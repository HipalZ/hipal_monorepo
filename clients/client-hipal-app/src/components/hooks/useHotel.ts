import { apiRpc } from "@hi/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import useBusinessDetails from "../store/useBusinessDetails";
import { useHotelTemp } from "../store/useHotelTemp";
import { expelIfSessionOut } from "./sessionGuard";

export const useGetAllRooms = () => {
  const businessId = useBusinessDetails((s) => s.businessDetails.businessId);
  const getRooms = async () => {
    const response = await apiRpc.hotel.rooms.fetch_rooms.$get({
      query: { businessId },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data;
    }

    return [];
  };

  const { isLoading, data: rooms } = useQuery({
    queryKey: ["allRooms", businessId],
    queryFn: getRooms,
    enabled: !!businessId,
  });
  return { isLoading, rooms };
};

export const useCheckoutRequest = () => {
  const room = useSearchParams()?.get("room");
  const router = useRouter();
  const { setIsSubmitting } = useHotelTemp();
  const triggerCheckoutRequest = async (payload: {
    userId: string;
    businessId: string;
  }) => {
    const roomResponse = await apiRpc.hotel.rooms.fetch_room.$get({
      query: {
        businessId: payload.businessId,
        roomName: room,
      },
    });
    if (!roomResponse.ok) return [];
    const roomData = await roomResponse.json();
    const response = await apiRpc.hotel.rooms.check_out_request.$post({
      json: {
        userId: payload.userId,
        roomId: roomData?.data?._id,
      },
    });
    if (expelIfSessionOut(response, router)) throw new Error("SESSION_OUT");
    if (!response.ok) throw new Error("Failed to send checkout request");
    return response.json();
  };

  const { mutateAsync: checkoutRequest } = useMutation({
    mutationFn: triggerCheckoutRequest,
    // Success/error UX is owned by the caller (the checkout modal in
    // ChatCardSection) — the hook only resets the shared submitting flag.
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  return { checkoutRequest };
};
