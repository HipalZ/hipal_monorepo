"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellDot, X } from "lucide-react";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { Button } from "@/components/ui/button";
import { useGetAllChats } from "@/components/hooks/useHotelRoom";

interface ChatReply {
  _id: string;
  description: string;
  status?: string;
  date: number;
}

interface RoomChat {
  _id: string;
  description?: string;
  roomChatReplyIds?: ChatReply[];
}

// Written by accept_alert when front office accepts a checkout request.
const ACCEPT_PREFIX = "Please visit the front office";
const CHECKOUT_CHAT_DESCRIPTION = "Checkout request created";
const DISMISS_KEY = "checkoutStatusDismissedReplyIds";

const readDismissed = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
};

/**
 * Watches the (already polled) room chat for front-office replies to the
 * guest's checkout request and surfaces the latest one as a popup — e.g.
 * "Please visit the front office by 04:30 PM." Dismissals are remembered
 * per reply so the popup doesn't re-appear on every poll.
 */
const CheckoutStatusPopup = ({
  businessId,
  roomName,
}: {
  businessId: string;
  roomName: string;
}) => {
  const { chatData } = useGetAllChats({ businessId, roomName });
  const [activeReply, setActiveReply] = useState<ChatReply | null>(null);

  useEffect(() => {
    if (!chatData?.length) return;

    const dismissed = readDismissed();
    const replies = (chatData as RoomChat[])
      .filter((chat) => chat.description === CHECKOUT_CHAT_DESCRIPTION)
      .flatMap((chat) => chat.roomChatReplyIds ?? []);

    if (!replies.length) return;

    const latest = replies.reduce((a, b) => (a.date > b.date ? a : b));
    if (!dismissed.includes(latest._id)) {
      setActiveReply(latest);
    }
  }, [chatData]);

  const dismiss = () => {
    if (activeReply && typeof window !== "undefined") {
      const dismissed = readDismissed();
      if (!dismissed.includes(activeReply._id)) {
        window.localStorage.setItem(
          DISMISS_KEY,
          JSON.stringify([...dismissed, activeReply._id]),
        );
      }
    }
    setActiveReply(null);
  };

  // Rejected replies are written with status "WARNING" (see accept_alert);
  // accepted and delivered replies are "NORMAL". Text prefix only separates
  // the accepted ETA message from the delivery/completion ack.
  const isDeclined = activeReply?.status === "WARNING";
  const isAccepted =
    !isDeclined && activeReply?.description?.startsWith(ACCEPT_PREFIX);

  return (
    <BottomPopUp
      hide
      height="auto"
      show={Boolean(activeReply)}
      onClose={dismiss}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="relative p-6 text-center"
      >
        <Button
          variant="secondary"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-xl text-black hover:text-gray-600"
        >
          <X color="red" />
        </Button>

        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isDeclined ? "bg-red-50" : "bg-green-100"
          }`}
        >
          <BellDot
            className={`h-8 w-8 ${
              isDeclined ? "text-red-500" : "text-green-600"
            }`}
          />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-900 inter">
          {isDeclined
            ? "Checkout Request Declined"
            : isAccepted
              ? "Checkout Update"
              : "Checkout Completed"}
        </h2>
        <p className="mb-6 text-sm text-gray-600 inter">
          {activeReply?.description}
        </p>

        <Button
          className={`w-full rounded-xl text-white ${
            isDeclined
              ? "bg-[#E85D3A] hover:bg-[#d14e2f]"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={dismiss}
        >
          Got it
        </Button>
      </motion.div>
    </BottomPopUp>
  );
};

export default CheckoutStatusPopup;
