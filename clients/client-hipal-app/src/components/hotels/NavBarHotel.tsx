"use client"

import { motion } from "framer-motion"
import { MessageCircle, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHotelBusinessData } from "../store/useHotelBusinessData"
import { useRouter } from "next/navigation"

interface NavBarHotelProps {
  businessName?: string
  onChatClick?: () => void
  onBackClick?: () => void
  showBackButton?: boolean
  hideChat?: boolean
  text?: string
  centerText?: boolean
  hideLogo?: boolean
}

export function NavBarHotel({
  businessName,
  onChatClick,
  onBackClick,
  showBackButton = false,
  hideChat = false,
  text,
  centerText = false,
  hideLogo = false,
}: NavBarHotelProps) {
  const router = useRouter()
  const logoUrl = useHotelBusinessData(s => s.hotelData.logoUrl)
  

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <motion.div
      className={cn("sticky top-0 left-0 right-0 z-50 bg-base-100 backdrop-blur-md border-b")}
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Section: Back Button and Logo */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleBackClick}
              className="mr-1 text-black hover:bg-black/5"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
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
            <h1 className="text-lg font-medium text-h-primary font-playfair">
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
              aria-label="Chat with us"
              className="relative text-white bg-[#000000] hover:bg-[#333333]"
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
  )
}
