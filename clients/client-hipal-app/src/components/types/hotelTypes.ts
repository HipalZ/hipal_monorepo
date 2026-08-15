import type { FOOD_TYPES } from "../atoms/foodType";
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
  avgCompletionTime?: number;
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
  acceptedAt?: number;
  createdAt?: number;
  deliveredAt?: number;
}

export interface Cart {
  id: string;
  portion: string | null;
  extras: any[];
  quantity: number;
  dish: {
    types: FOOD_TYPES[];
    _id: string;
    name: string;
    categoryIds: string[];
    price: number;
    visibility: boolean;
    availability: true;
    dishTypes: string[];
    images: string[];
    portions: any[];
    description: string;
  };
}

export interface RoomChat {
  cart: any;
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
  chat?: RoomChat;
  reply: RoomChatReply;
  userResponses: Record<string, string>;
  handleActionClick: (chatReplyId: string, action: string) => void;
  openReview: boolean;
  selectedReplyId: string;
  handleReviewSubmit: (userId: string, rating: number) => void;
}
