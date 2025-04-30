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
