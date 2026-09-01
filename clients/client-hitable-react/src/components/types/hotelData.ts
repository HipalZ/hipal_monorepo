import type { FOOD_TYPES } from '../atoms/dishType';

export type NavItemHotelTypes = 'Alerts' | 'History' | 'Sales' | 'Rooms' | 'Reviews';
export enum NavItemsHotelEnum {
  Alerts = 'Alerts',
  History = 'History',
  Sales = 'Sales',
  Rooms = 'Rooms',
  Reviews = 'Reviews',
}

export interface guestData {
  _id: string;
  name: string;
  phone: string;
}

export interface RoomData {
  amenities: string[];
  authCode: string;
  businessId: string;
  capacity: number;
  downLoadLink: string;
  images: string[];
  name: string;
  pricePerNight: number;
  rating: number;
  roomStatus: string;
  roomType: string;
  staffIds: string[];
  userIds: guestData[];
  zoneId: string;
  _id: string;
}

export interface Service {
  image: string;
  _id: string;
  name: string;
  /** SLA minutes — populated on alert feeds, absent elsewhere. */
  avgAcceptanceTime?: number;
  avgCompletionTime?: number;
  avgDeliveryTime?: number;
}

interface CreatedBy {
  _id: string;
  name: string;
  phone: string;
}

interface AcceptedBy {
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
export interface Alert {
  message: string;
  name: string;
  _id: string;
  alertProgress:
    | 'CREATED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'DELIVERED'
    | 'WARNING'
    | 'ESCALATION'
    | 'NOT_DELIVERED'
    | 'MESSAGE'
    | 'NON_ACCEPTED_AND_WARNING'
    | 'NON_ACCEPTED_AND_ESCALATION'
    | 'IS_ACCEPTED_AND_WARNING'
    | 'IS_ACCEPTED_AND_ESCALATION'
    | 'RESOLVED';
  serviceIds: Service[];
  businessId: string;
  userId: string;
  createdAt: number;
  wakeUpAt?: number;
  createdBy: CreatedBy;
  acceptedBy: AcceptedBy;
  level?: number;
  isEscalated?: boolean;
  roomId: Room;
  cart: Cart[];
  __v: number;
  acceptedAt: number;
  deliveredAt: number;
  rejectedAt?: number;
  deliveredBy: AcceptedBy;
  rejectedBy?: AcceptedBy;
}

export interface AlertProgress {
  alertProgress: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'DELIVERED' | 'WARNING' | 'ESCALATION' | 'NOT_DELIVERED';
}

export interface User {
  _id: string;
  name: string;
  phone: string;
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

export interface Cart {
  id: string;
  portion: {
    name: string;
    price: number;
    default?: boolean;
    portionTypes?: string[];
    _id?: string;
  } | null;
  extras: any[];
  quantity: number;
  dish: {
    types: FOOD_TYPES[];
    _id: string;
    name: string;
    categoryIds: string[];
    price: number;
    avgPrepTime?: number;
    visibility: boolean;
    availability: true;
    dishTypes: string[];
    images: string[];
    portions: any[];
    description: string;
  };
}

export interface RoomChat {
  cart: Cart[];
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
