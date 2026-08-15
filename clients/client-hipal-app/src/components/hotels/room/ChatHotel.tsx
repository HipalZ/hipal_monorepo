"use client";
import { useCallback, memo } from "react";
import { useGetAllChats, useReviewChat } from "@/components/hooks/useHotelRoom";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import { GuestSupportScreen } from "./ChatHotelComponents";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import type { HotelWelcomeCardProps } from "./RoomWelcome";
import { useLogin } from "../../store/useLogin";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MemoChatHotel = ({
  hotelName,
  logo,
  room = "",
  businessId = "",
  contactPhone,
}: HotelWelcomeCardProps) => {
  const { setIsOpenChat, isOpenChat } = useHotelTemp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { chatData } = useGetAllChats(
    {
      businessId,
      roomName: room,
    },
    { enabled: isOpenChat, refetchInterval: 1000 }
  );
  const { reviewChat } = useReviewChat();
  const userDetails = useLogin((s) => s.userDetails);
  const onClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("chat");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpenChat(false);
  }, [pathname, router, searchParams, setIsOpenChat]);

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
    <BottomPopUp
      show={isOpenChat}
      onClose={onClose}
      hide
      height="100dvh"
      key={businessId}
      manageHistory={false}
    >
      <GuestSupportScreen
        hotelName={hotelName}
        logo={logo}
        room={room}
        requests={chatData ?? []}
        onClose={onClose}
        onReviewSubmit={handleReviewSubmit}
        contactPhone={contactPhone}
      />
    </BottomPopUp>
  );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;
