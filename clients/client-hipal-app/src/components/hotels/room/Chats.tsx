"use client";;
import { ActionType } from "@/components/utils/helpersHotel";
import { useCallback, useState, useRef, useEffect } from "react";
import { useGetAllChats, useReviewChat, useSendChat } from "@/components/hooks/useHotelRoom";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import type { HotelWelcomeCardProps } from "./RoomWelcome";
import type { RoomChat } from "@/components/types/hotelTypes";
import { useRouter } from "next/navigation";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";
import { useLogin } from "../../store/useLogin";
import { toast } from "react-toastify";

const ChatHeader = dynamic(
    () => import("./ChatHotelComponents").then((mod) => mod.ChatHeader),
    {
        loading: () => <SkeletonLoader height={200} />,
    },
)

const ChatMessageHotel = dynamic(
    () => import("./ChatHotelComponents").then((mod) => mod.ChatMessageHotel),
    {
        loading: () => <SkeletonLoader height={200} />,
    },
)

const Chats = ({
    hotelName,
    logo,
    room = "",
    businessId = "",
}: HotelWelcomeCardProps) => {
    const router = useRouter();
    const { chatData } = useGetAllChats({
        businessId,
        roomName: room,
    });
    const { reviewChat } = useReviewChat();
    const { sendChat } = useSendChat();
    const { isOpenChat } = useHotelTemp();
    const [openReview, setOpenReview] = useState(false);
    const [selectedReplyId, setSelectedReplyId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userResponses, setUserResponses] = useState<Record<string, string>>({});
    const userDetails = useLogin(s => s.userDetails)
    const onClose = useCallback(() => {
        router.back();
    }, [router]);

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
                toast.error("Unable to report this as not delivered. Please try again.");
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

    const handleReviewSubmit = async(userId: string, rating: number) => {
        await reviewChat({
            roomChatReplyId: selectedReplyId,
            reviewRating: rating,
            businessId,
            userId: userDetails?._id || '',
        })
        setOpenReview(false);
    }
    return (
        <>
            <div className="text-black flex flex-col h-full bg-gray-100 poppins">
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
        </>
    )
}

export default Chats
