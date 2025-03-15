export type NavItemHotelTypes = "Alerts" | "History" | "Sales" | "Rooms";
export enum NavItemsHotelEnum {
    Alerts = "Alerts",
    History = "History",
    Sales = "Sales",
    Rooms = "Rooms",
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

interface Service {
    _id: string;
    name: string;
}

interface CreatedBy {
    _id: string;
    name: string;
    phone: string;
}

interface AcceptedBy{
    _id: string;
    name: string;
    phone: string;
}

interface Room {
    _id: string;
    name: string;
}

export interface Alert {
    name: string;
    _id: string;
    alertProgress: "CREATED" | "ACCEPTED" | "REJECTED" | "DELIVERED";
    serviceIds: Service[];
    businessId: string;
    userId: string;
    createdAt: number;
    createdBy: CreatedBy;
    acceptedBy: AcceptedBy;
    roomId: Room;
    cart: string[];
    __v: number;
    acceptedAt: number;
    deliveredAt: number;
    deliveredBy: AcceptedBy;
}