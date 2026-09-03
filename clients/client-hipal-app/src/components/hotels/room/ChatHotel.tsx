"use client";
import { useCallback, memo, useEffect } from "react";
import { useGetAllChats, useReviewChat, useSendChat } from "@/components/hooks/useHotelRoom";
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
  const { sendChat } = useSendChat();
  const userDetails = useLogin((s) => s.userDetails);

  useEffect(() => {
    const shouldOpenChat = searchParams.get("chat") === "1";
    if (isOpenChat !== shouldOpenChat) {
      setIsOpenChat(shouldOpenChat);
    }
  }, [isOpenChat, searchParams, setIsOpenChat]);

  const onClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("chat");
    params.delete("requestId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpenChat(false);
  }, [pathname, router, searchParams, setIsOpenChat]);

  const handleReviewSubmit = async (roomChatReplyId: string, rating: number, review?: string) => {
    try {
      await reviewChat({
        roomChatReplyId,
        reviewRating: rating,
        review: review?.trim() ?? "",
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

  const handleNotDelivered = async (roomChatReplyId: string) => {
    try {
      await sendChat({
        roomChatReplyId,
        userId: userDetails?._id || "",
      });
      toast.success("Complaint raised. The hotel team has been notified.");
    } catch (error) {
      console.error("Error raising not delivered complaint:", error);
      toast.error("Could not raise the complaint. Please try again.");
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
        onNotDelivered={handleNotDelivered}
        contactPhone={contactPhone}
      />
    </BottomPopUp>
  );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;
