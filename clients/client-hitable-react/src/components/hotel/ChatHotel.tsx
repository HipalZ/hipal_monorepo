import { useGetAllChats, useReviewChat, useSendChat } from '@/hooks/useHotelApis';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useHiClientZ } from '../store/useHiClientzData';
import { useHotelStore } from '../store/useHotelStore';
import type { RoomChat } from '../types/hotelData';
import { ActionType } from '../utils/helpersHotel';
import { ChatHeader, ChatMessageHotel } from './ChatHotelComponents';

export interface HotelWelcomeCardProps {
  hotelName: string;
  logo: string;
  room: string;
  businessId?: string;
  customLink?: string;
}
const MemoChatHotel = ({ hotelName, logo, room = '', businessId = '' }: HotelWelcomeCardProps) => {
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
  const captainData = useHiClientZ((s) => s.captainData);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatData, userResponses, isOpenChat]);

  const handleReviewSubmit = (userId: string, rating: number) => {
    reviewChat({
      roomChatReplyId: selectedReplyId,
      reviewRating: rating,
      businessId,
      userId: captainData?._id || '',
    });
    setOpenReview(false);
  };

  return (
    <div className="poppins flex flex-col overflow-y-auto bg-gray-100 text-black">
      <ChatHeader hotelName={hotelName} logo={logo} room={room} onClose={onClose} />
      <div className="flex-1 space-y-6 overflow-y-auto p-3">
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
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

const ChatHotel = memo(MemoChatHotel);
export default ChatHotel;
