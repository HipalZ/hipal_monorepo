"use client";
import { ActionType } from "@/components/utils/helpersHotel";
import { useCallback, useState, useRef, useEffect, memo } from "react";
import { useGetAllChats, useReviewChat, useSendChat } from "@/components/hooks/useHotelRoom";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import { ChatHeader, ChatMessageHotel } from "./ChatHotelComponents";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import type { HotelWelcomeCardProps } from "./RoomWelcome";
import type { RoomChat } from "@/components/types/hotelTypes";

const MemoChatHotel = ({
    hotelName,
    logo,
    room ="",
    businessId="",
}: HotelWelcomeCardProps) => {
    const { chatData } = useGetAllChats({
        businessId,
        roomName: room,
    });
    const {reviewChat} = useReviewChat();
    const { sendChat } = useSendChat();
    const { setIsOpenChat, isOpenChat } = useHotelTemp();
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

    const handleReviewSubmit = (userId:string, rating:number) =>{
        reviewChat({
            roomChatReplyId: selectedReplyId,
            reviewRating: rating,
            businessId,
            userId,
        })    
        setOpenReview(false);
    }

    return (
        <BottomPopUp show={isOpenChat} onClose={onClose} hide height="100dvh" key={businessId}>
            <div className="text-black flex flex-col h-full bg-gray-100 poppins">
                <ChatHeader hotelName={hotelName} logo={logo} room={room} onClose={onClose} />
                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    {chatData && chatData?.length > 0 ? chatData?.map((chat:RoomChat) => (
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
        </BottomPopUp>
    );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;