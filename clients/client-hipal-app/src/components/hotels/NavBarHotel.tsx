"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHotelBusinessData } from "../store/useHotelBusinessData";
import { useRouter } from "next/navigation";
import { useHotelTemp } from "../store/useHotelTemp";

interface NavBarHotelProps {
  businessName?: string;
  // onChatClick?: () => void
  onBackClick?: () => void;
  showBackButton?: boolean;
  hideChat?: boolean;
  text?: string;
  centerText?: boolean;
  hideLogo?: boolean;
}

export function NavBarHotel({
  businessName,
  // onChatClick,
  onBackClick,
  showBackButton = false,
  hideChat = false,
  text,
  centerText = false,
  hideLogo = false,
}: NavBarHotelProps) {
  const { setIsOpenChat, isOpenChat } = useHotelTemp();
  const router = useRouter();
  const logoUrl = useHotelBusinessData((s) => s.hotelData.logoUrl);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const onChatClick = () => {
    setIsOpenChat(!isOpenChat);
  };

  return (
    <>
      <motion.div
        className={cn(
          "fixed w-full max-w-[30rem] !transform left-1/2 top-0 -translate-x-1/2  z-50 bg-white border-b",
        )}
        initial={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="w-full max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Section: Back Button and Logo */}
          <div className="flex items-center gap-3 bg-primary rounded-lg ">
            {showBackButton && (
              <Button
                size="icon"
                onClick={handleBackClick}
                className="mr-1"
                aria-label="Go back"
                style={{
                  color: "var(--s)",
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {logoUrl && !hideLogo && (
              <div className="relative w-10 h-10 overflow-hidden border rounded-full border-muted">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={businessName || "Business logo"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            )}

            {!logoUrl && businessName && !centerText && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full">
                <span className="font-semibold text-primary font-playfair">
                  {businessName.charAt(0) || "B"}
                </span>
              </div>
            )}
          </div>

          {/* Center Text */}
          {text && centerText && (
            <div className="absolute transform -translate-x-1/2 left-1/2">
              <h1 className="text-lg font-bold text-h-primary font-playfair">
                {text}
              </h1>
            </div>
          )}

          {/* Right Section: Text (if not centered) and Chat Button */}
          <div className="flex items-center gap-4">
            {text && !centerText && (
              <h1 className="text-lg font-medium text-h-primary font-playfair">
                {text}
              </h1>
            )}

            {!hideChat && (
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
            )}
          </div>
        </div>
      </motion.div>
      <div className="h-[4rem] " />
    </>
  );
}
