import { useCallback, useState, useRef, useEffect, memo } from "react";
import { ActionType } from "../utils/helpersHotel";
import { useHotelStore } from "../store/useHotelStore";
import { ChatHeader, ChatMessageHotel } from "./ChatHotelComponents";
import { useGetAllChats, useReviewChat, useSendChat } from "@/hooks/useHotelApis";
import type { RoomChat } from "../types/hotelData";

export interface HotelWelcomeCardProps {
    hotelName: string
    logo: string
    room: string
    businessId?: string
    customLink?: string
}
const MemoChatHotel = ({
    hotelName,
    logo,
    room = "",
    businessId = "",
}: HotelWelcomeCardProps) => {
    const { chatData } = useGetAllChats({
        businessId,
        roomName: room,
    });
    const { reviewChat } = useReviewChat();
    const { sendChat } = useSendChat();
    const { setIsOpenChat, isOpenChat } = useHotelStore();
    const [openReview, setOpenReview] = useState(false);
    const [selectedReplyId, setSelectedReplyId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userResponses, setUserResponses] = useState<Record<string, string>>({});

    const onClose = useCallback(() => {
        setIsOpenChat(false);
    }, [setIsOpenChat]);

    const handleActionClick = (chatReplyId: string, action: string) => {
        setUserResponses((prev) => ({
            ...prev,
            [chatReplyId]: action,
        }));
        if (action === ActionType.NotDelivered) {
            sendChat({
                roomChatReplyId: chatReplyId,
            });
        }
        if (action === ActionType.ReviewAndThanks) {
            setOpenReview(true);
            setSelectedReplyId(chatReplyId);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatData, userResponses, isOpenChat]);

    const handleReviewSubmit = (userId: string, rating: number) => {
        reviewChat({
            roomChatReplyId: selectedReplyId,
            reviewRating: rating,
            businessId,
            userId,
        })
        setOpenReview(false);
    }

    return (
        <div className="text-black flex flex-col bg-gray-100 poppins overflow-y-auto">
            <ChatHeader hotelName={hotelName} logo={logo} room={room} onClose={onClose} />
            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {chatData && chatData?.length > 0 ? chatData?.map((chat: RoomChat) => (
                    <ChatMessageHotel
                        key={chat._id}
                        chat={chat}
                        userResponses={userResponses}
                        handleActionClick={handleActionClick}
                        openReview={openReview}
                        selectedReplyId={selectedReplyId}
                        handleReviewSubmit={handleReviewSubmit}
                    />
                )) :
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet</p>
                    </div>}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;