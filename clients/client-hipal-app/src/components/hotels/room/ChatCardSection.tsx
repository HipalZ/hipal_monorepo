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
      className="mx-4 mt-2 mb-4 rounded-2xl shadow-lg px-4 py-4 flex items-center border cursor-pointer transition hover:shadow-xl active:scale-[0.98]"
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
