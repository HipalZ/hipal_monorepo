"use client";

import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLogin } from "../store/useLogin";
import { useEffect } from "react";

export const useCheckRoomStatus = (
  businessId: string,
  room: string,
  customLink: string,
  userID?: string
) => {
  const router = useRouter();
  const fallBackUserId = useLogin((s) => s.userDetails._id);

  const checkRoomStatus = async () => {
    if (!userID && !fallBackUserId) {
      return { status: 401, message: "User not logged in" };
    }

    try {
      const response = await apiRpc.hotel.rooms.auth_code.$get({
        query: {
          businessId: businessId,
          room: room,
          userId: userID || fallBackUserId,
        },
      });
      return response;
    } catch (error) {
      console.error("Error checking room status:", error);
      return { status: 500, message: "Error checking room status" };
    }
  };

  const {
    isLoading: checkingIn,
    data: checkRoom,
    error,
  } = useQuery({
    queryKey: ["checkRoomStatus", businessId, room, userID, fallBackUserId],
    queryFn: checkRoomStatus,
    enabled: !!businessId && !!room && (!!userID || !!fallBackUserId),
  });

  useEffect(() => {
    if (
      businessId &&
      room &&
      (userID || fallBackUserId) &&
      checkRoom?.status === 404
    ) {
      router.push(`/${customLink}/hotel`);
    }
  }, [checkRoom, customLink, router, businessId, room, userID, fallBackUserId]);

  return { checkingIn, checkRoom, error };
};
