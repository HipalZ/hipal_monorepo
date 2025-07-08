"use client";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const ChatCardSection = () => {
  const { setIsOpenChat, isOpenChat } = useHotelTemp();

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };

  return (
    <div
      onClick={onChatClick}
      className="mx-4 mt-2 mb-4 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] px-4 py-4 flex items-center cursor-pointer transition hover:shadow-xl active:scale-[0.98]"
      role="button"
      tabIndex={0}
      aria-label="Open chat"
    >
      <div className="flex-1">
        <p className="font-light text-h-primary text-xs poppins mb-1">
          For any further assistance.
        </p>
        <h1 className="font-semibold text-h-primary text-base poppins">
          Chat With Us
        </h1>
      </div>
      <Button
        size="icon"
        aria-label="Chat with us"
        className="relative transition-colors rounded-full bg-green-700 text-white"
      >
        <MessageCircle />
        <motion.span
          className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-700"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        />
      </Button>
    </div>
  );
};

export default ChatCardSection;
