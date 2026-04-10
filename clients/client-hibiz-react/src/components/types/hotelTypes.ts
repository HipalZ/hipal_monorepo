import { FOOD_TYPES } from "@/components/atom/FoodType";

export interface ServiceId {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  name: string;
  phone: string;
}

export interface Room {
  _id: string;
  name: string;
}

export interface EscalationItem {
  deliveredAt: number;
  _id: string;
  alertProgress: string;
  serviceIds: ServiceId[];
  businessId: string;
  userId: User;
  createdAt: number;
  createdBy: User;
  roomId: Room;
  cart: any[];
  roomChatComplainId: null;
  isEscalated: boolean;
  __v: number;
}

export interface ServiceDataItem {
  name: string;
  count: number;
}

export interface DashboardFilters {
  activeServiceFilter: string | null;
  setActiveServiceFilter: (filter: string | null) => void;
  activeRoomFilter: string | null;
  setActiveRoomFilter: (filter: string | null) => void;
}

export interface FilterType {
  type: "service" | "room";
  value: string | null;
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

type ReviewUser = {
  _id?: string;
  name?: string;
  phone?: string;
};

type ReviewRoom = {
  _id?: string;
  name?: string;
};

type ReviewService = {
  _id?: string;
  name?: string;
};

type ReviewStaff = {
  _id?: string;
  name?: string;
  phone?: string;
};

type ReviewAlert = {
  serviceIds?: ReviewService[];
  acceptedBy?: ReviewStaff | null;
  deliveredBy?: ReviewStaff | null;
};

export type ReviewItem = {
  _id?: string;
  userId?: ReviewUser | string | null;
  reviewRating?: number | null;
  improvementAreas?: string[];
  staffs?: string[];
  date?: number;
  isRead?: boolean;
  readAt?: number;
  readBy?: ReviewStaff | null;
  roomId?: ReviewRoom | null;
  alertId?: ReviewAlert | null;
  note?: string;
};

export type ReviewApiResponse = {
  err: boolean;
  data: ReviewItem[];
  message?: string;
};

type CuratedReviewRow = {
  "Review Time": string;
  "Guest Name": string;
  "Room No": string;
  "Reviewed Service": string;
  Rating: number | "";
  "Improvement Areas": string;
  "Accepted By": string;
  "Completed By": string;
  Read: "TRUE" | "FALSE";
  "Read At": string;
  "Read By": string;
  "Guest Note": string;
};
