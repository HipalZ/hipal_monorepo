"use client";
import React from "react";
import { useHotelTemp } from "../store/useHotelTemp";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const ChatButton = () => {
  const { setIsOpenChat, isOpenChat } = useHotelTemp();

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };
  return (
    <Button
      size="icon"
      onClick={onChatClick}
      style={{
        color: "var(--s)",
      }}
      aria-label="Chat with us"
      className="relative transition-colors rounded-full bg-primary"
    >
      <MessageCircle />
      <motion.span
        className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"
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
  );
};

export default ChatButton;
