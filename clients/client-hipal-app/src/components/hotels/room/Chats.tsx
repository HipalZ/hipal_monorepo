"use client";
import { useCallback } from "react";
import { useGetAllChats, useReviewChat } from "@/components/hooks/useHotelRoom";
import type { HotelWelcomeCardProps } from "./RoomWelcome";
import { useRouter } from "next/navigation";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";
import { useLogin } from "../../store/useLogin";
import toast from "react-hot-toast";

const GuestSupportScreen = dynamic(
  () => import("./ChatHotelComponents").then((mod) => mod.GuestSupportScreen),
  {
    loading: () => <SkeletonLoader height={200} />,
  }
);

const Chats = ({
  hotelName,
  logo,
  room = "",
  businessId = "",
  customLink = "",
  contactPhone,
}: HotelWelcomeCardProps) => {
  const router = useRouter();
  const { chatData } = useGetAllChats(
    {
      businessId,
      roomName: room,
    },
    { refetchInterval: 1000 }
  );
  const { reviewChat } = useReviewChat();
  const userDetails = useLogin((s) => s.userDetails);
  const onClose = useCallback(() => {
    router.push(
      `/${customLink || businessId}/hotel/checkin?room=${encodeURIComponent(
        room || "hipalz"
      )}`
    );
  }, [businessId, customLink, room, router]);

  const handleReviewSubmit = async (roomChatReplyId: string, rating: number) => {
    try {
      await reviewChat({
        roomChatReplyId,
        reviewRating: rating,
        businessId,
        userId: userDetails?._id || "",
      });
      toast.success("Thank you for sharing your experience.");
    } catch (error) {
      console.error("Error submitting service review:", error);
      toast.error("Could not submit your rating. Please try again.");
      throw error;
    }
  };
  return (
    <>
      <GuestSupportScreen
        hotelName={hotelName}
        logo={logo}
        room={room}
        requests={chatData ?? []}
        onClose={onClose}
        onReviewSubmit={handleReviewSubmit}
        contactPhone={contactPhone}
      />
    </>
  );
};

export default Chats;
