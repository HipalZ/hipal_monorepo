"use client";
import { useHotelTemp } from "@/components/store/useHotelTemp";

const ChatCardSection = () => {
  const { setIsOpenChat, isOpenChat } = useHotelTemp();

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };

  return (
    <div
      onClick={onChatClick}
      className="mx-4 mt-2 mb-4 rounded-2xl shadow-lg px-4 py-4 flex items-center border bg-blue-50 cursor-pointer transition hover:shadow-xl active:scale-[0.98]"
      role="button"
      tabIndex={0}
      aria-label="Open chat"
    >
      <div className="flex-1">
        <h1 className="font-semibold text-h-primary text-base poppins mb-1">
          Chat With Us
        </h1>
        <p className="font-light text-h-primary text-xs poppins opacity-80">
          See your service requests, get real-time updates.
        </p>
      </div>
      <button
        type="button"
        className="text-xs poppins ml-4 flex items-center p-2 bg-black text-white rounded-xl font-light transition shadow-lg"
      >
        View Chats
      </button>
    </div>
  );
};

export default ChatCardSection;
