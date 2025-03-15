import type { BusinessDetails } from "./businessData"

export interface User {
    _id: string
    name: string
    phone: string
}

export interface Room {
    _id: string
    businessId: string
    amenities: string[]
    availability: boolean
    name: string
    tax: number
    zoneId: string
    roomType: string
    pricePerNight: number
    capacity: number
    roomStatus: string
    staffIds: string[]
    authCode: string
    rating: number
    size: string
    description: string
    images: string[]
    userIds: User[]
    slug: string
    __v: number
    downLoadLink: string
}

export interface IRoomProps {
    business: BusinessDetails
    rooms: Room[]
}