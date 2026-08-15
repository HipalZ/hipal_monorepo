"use client";
import { ActionType } from "@/components/utils/helpersHotel";
import { useCallback, useState, useRef, useEffect, memo } from "react";
import {
  useGetAllChats,
  useReviewChat,
  useSendChat,
} from "@/components/hooks/useHotelRoom";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import { ChatHeader, ChatMessageHotel } from "./ChatHotelComponents";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import type { HotelWelcomeCardProps } from "./RoomWelcome";
import type { RoomChat } from "@/components/types/hotelTypes";
import { useLogin } from "../../store/useLogin";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MemoChatHotel = ({
  hotelName,
  logo,
  room = "",
  businessId = "",
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
  const [openReview, setOpenReview] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userResponses, setUserResponses] = useState<Record<string, string>>(
    {}
  );
  const userDetails = useLogin((s) => s.userDetails);
  const onClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("chat");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpenChat(false);
  }, [pathname, router, searchParams, setIsOpenChat]);

  const handleActionClick = async (chatReplyId: string, action: string) => {
    if (action === ActionType.NotDelivered) {
      try {
        await sendChat({
          roomChatReplyId: chatReplyId,
          userId: userDetails?._id || "",
        });
        setUserResponses((prev) => ({
          ...prev,
          [chatReplyId]: action,
        }));
      } catch (error) {
        console.error("Error sending not delivered complaint:", error);
        toast.error(
          "Unable to report this as not delivered. Please try again."
        );
      }
    }
    if (action === ActionType.ReviewAndThanks) {
      setUserResponses((prev) => ({
        ...prev,
        [chatReplyId]: action,
      }));
      setOpenReview(true);
      setSelectedReplyId(chatReplyId);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData, userResponses, isOpenChat]);

  const handleReviewSubmit = async (userId: string, rating: number) => {
    await reviewChat({
      roomChatReplyId: selectedReplyId,
      reviewRating: rating,
      businessId,
      userId: userDetails?._id || "",
    });
    setOpenReview(false);
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
      <div className="text-black flex flex-col h-full bg-gray-100 poppins">
        <ChatHeader
          hotelName={hotelName}
          logo={logo}
          room={room}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {chatData && chatData?.length > 0 ? (
            chatData?.map((chat: RoomChat) => (
              <ChatMessageHotel
                key={chat._id}
                chat={chat}
                userResponses={userResponses}
                handleActionClick={handleActionClick}
                openReview={openReview}
                selectedReplyId={selectedReplyId}
                handleReviewSubmit={handleReviewSubmit}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </BottomPopUp>
  );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;
