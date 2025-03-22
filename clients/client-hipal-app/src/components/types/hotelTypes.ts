import type { BusinessDetails } from "./businessData";

export interface User {
  _id: string;
  name: string;
  phone: string;
}

export interface Room {
  _id: string;
  businessId: string;
  amenities: string[];
  availability: boolean;
  name: string;
  tax: number;
  zoneId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  roomStatus: string;
  staffIds: string[];
  authCode: string;
  rating: number;
  size: string;
  description: string;
  images: string[];
  userIds: User[];
  slug: string;
  __v: number;
  downLoadLink: string;
}

export interface IRoomProps {
  business: BusinessDetails;
  rooms: Room[];
}

export interface Service {
  _id: string;
  name: string;
}

export interface RoomChatReply {
  _id: string;
  userId: User;
  action: boolean;
  status: string;
  date: number;
  description: string;
  roomChatId: string;
  complainIds: any[];
}

interface Alert {
  _id: string;
  alertProgress: string;
  serviceIds: Service[];
}

export interface RoomChat {
  _id: string;
  userId: User;
  roomId: string;
  alertId: Alert;
  roomChatReplyIds: RoomChatReply[];
  date: number;
  description: string;
  isDeleted: boolean;
  __v: number;
}

export interface RoomChatResponse {
  err: boolean;
  data: RoomChat[];
  message: string;
}

export interface ChatHeaderProps {
  hotelName: string;
  logo: string;
  room: string;
  onClose: () => void;
}

export interface ChatMessageHotelProps {
  chat: RoomChat;
  userResponses: Record<string, string>;
  handleActionClick: (chatReplyId: string, action: string) => void;
  openReview: boolean;
  selectedReplyId: string;
  handleReviewSubmit: (userId: string, rating: number) => void;
}

export interface ChatReplyMessageProps {
  reply: RoomChatReply;
  userResponses: Record<string, string>;
  handleActionClick: (chatReplyId: string, action: string) => void;
  openReview: boolean;
  selectedReplyId: string;
  handleReviewSubmit: (userId: string, rating: number) => void;
}