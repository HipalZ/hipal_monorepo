import { useState } from "react";
import { useHotelTemp } from "../store/useHotelTemp";
import { _useAllBusiness } from "../store/useAllBusiness";
import { format } from "date-fns";
import { useHotelBusinessData } from "../store/useHotelBusinessData";

export const useImageNextPrev = () => {
  const { nextImage: nextImageStore, prevImage: prevImageStore } = useHotelTemp();

  const nextImage = (roomId: string, imagesLength: number) => {
    nextImageStore(roomId, imagesLength);
  };

  const prevImage = (roomId: string, imagesLength: number) => {
    prevImageStore(roomId, imagesLength);
  };

  const handleImageClick = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const clickPosition = clientX - left;

    if (clickPosition < width / 2) {
      prevImage(roomId, imagesLength);
    } else {
      nextImage(roomId, imagesLength);
    }
  };

  return { nextImage, prevImage, handleImageClick };
};

export const useShareRoom = () => {
  const [shareState, setShareState] = useState({ showOptions: false, url: "" });
  const phone = useHotelBusinessData((state) => state.hotelData.phone);
  const shareCart = async (content: string) => {
    const message = encodeURIComponent(
      `Hi, I am interested about this room. Can I know more details?\n\n${content}`,
    )

    const whatsappUrl = `https://wa.me/+91${phone}?text=${message}`

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank")
    setShareState({ ...shareState, showOptions: false })
  }

  return { shareCart, shareState, setShareState };
}

export enum ActionType {
  NotDelivered = "NOT_DELIVERED",
  ReviewAndThanks = "REVIEW_AND_THANKS",
  Delivered = "Delivered",
  ESCALATION = "Escalation",
  WARNING = "WARNING",
}

export const actionOptions = [
  {
    id: "not-delivered",
    label: "Report an issue",
    helper: "Tell staff this is still pending",
    value: ActionType.NotDelivered,
  },
  {
    id: "review",
    label: "Rate this service",
    helper: "Share quick feedback",
    value: ActionType.ReviewAndThanks,
  },
];

export const reviewOptions = [
  { id: "Not Happy", text: "😞", value: 1 },
  { id: "Good", text: "😊", value: 3 },
  { id: "Great", text: "😍", value: 5 },
]
export const formatHotelTime = (timestamp: number) => {
  return format(new Date(timestamp), "h:mm a");
};
