import { Badge } from "@/components/ui/badge"
import { BedDouble, BedSingle, User, Key, Star, MessageCircleMore, ArrowRight } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckOut } from '@/hooks/useHotelApis';
import { useHotelStore } from '../store/useHotelStore';
import { useMutation } from '@tanstack/react-query';
import CommonBottomButton from '../atoms/bottomButton';
import { memo, lazy, useCallback } from "react";
import useBusinessData from "../store/useBusinessData";

const ChatHotel = lazy(() => import("./ChatHotel"));
const ReviewUsersHotel = lazy(() => import("./reviewUsersHotel"));

const MemoBookedRoomHotel = () => {
    const outletInfo = useBusinessData((s) => s.outletInfo);
    const { setOpenRoomModal, roomData, setIsOpenChat, isOpenChat } = useHotelStore();
    const { checkOut } = useCheckOut();
    const { mutateAsync, isPending } = useMutation({
        mutationFn: checkOut,
    })
    const handleCheckOut = async () => {
        mutateAsync()
    }
    const handleChat = useCallback(() => {
        setIsOpenChat(!isOpenChat)
    },[ isOpenChat, setIsOpenChat])

    return (
        <section className="w-full">
            {isOpenChat ? <ChatHotel
                hotelName={outletInfo?.name || ""}
                logo={outletInfo?.logoUrl || ""}
                room={roomData?.name}
                businessId={outletInfo?.businessId}
            /> : <section className="pb-[5rem]">
                <CardHeader className="space-y-4 pb-2">
                    <CardTitle className="text-2xl">
                        <header className="text-center">Room {roomData?.name}</header>
                    </CardTitle>
                </CardHeader>
                <center className="flex justify-around items-center gap-2 text-sm text-black bg-white mx-4 py-1 rounded-lg">
                    <Badge className="bg-blue-600">Booked</Badge>
                    <span>
                        {roomData?.roomType === "SINGLE" ? <BedSingle className="h-4 w-4" /> : <BedDouble className="h-4 w-4" />}{roomData?.roomType}
                    </span>
                    <span>Capacity: {roomData?.capacity}</span>
                    <div className="flex items-center ml-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{roomData?.rating}</span>
                    </div>
                </center>
                {/* Auth Code Section - Highlighted */}
                <article className="mx-4 my-2 rounded-lg bg-white p-3 border shadow-sm text-sm font-medium text-black flex justify-between items-center">
                    <span className="flex items-center">
                        <Key className="h-4 w-4 mr-1" />
                        Room Access Code
                    </span>
                    <div className="text-2xl font-bold tracking-wider text-blue-700">{roomData?.authCode}</div>
                </article>
                <article onClick={handleChat} className="m-4 rounded-lg bg-white p-3 border shadow-sm text-sm font-medium text-black flex justify-between items-center">
                    <span className="flex items-center">
                        <MessageCircleMore className="h-4 w-4 mr-1" />
                        Chat with us
                    </span>
                    <ArrowRight className="h-4 w-4" />
                </article>
                {/* Guest Information */}
                <CardContent className="pb-2 -mx-2">
                    <div className="space-y-3 border p-3 rounded-lg bg-white">
                        <h1 className="text-sm font-medium text-black">
                            <span className="inline-flex items-center"><User className="h-4 w-4 mr-1" />Guest Information</span>
                        </h1>
                        {roomData?.userIds?.map((user) => (
                            <div key={user?._id} className="pl-1 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-black">Name:</span>
                                    <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-black">Phone:</span>
                                    <span className="font-medium">{user.phone}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <ReviewUsersHotel />
                <CommonBottomButton
                    maxWidth="30rem"
                    position="mid"
                    fixed
                    shadow
                    buttons={[
                        {
                            text: '',
                            isBackButton: true,
                            onClick: () => setOpenRoomModal(false),
                            className: 'rounded-lg pl-3',
                        },
                        {
                            text: 'Check out',
                            onClick: handleCheckOut,
                            className: 'rounded-lg shadow-md text-white',
                            disable: isPending,
                            swipe: true,
                        },
                    ]}
                />
            </section>}
        </section>
    )
}
const BookedRoomHotel = memo(MemoBookedRoomHotel)
export default BookedRoomHotel

