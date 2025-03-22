import { Badge } from "@/components/ui/badge"
import { BedDouble, BedSingle, User, Key, Star, Copy, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckOut } from '@/hooks/useHotelApis';
import { useHotelStore } from '../store/useHotelStore';
import { useMutation } from '@tanstack/react-query';
import CommonBottomButton from '../atoms/bottomButton';
import { memo, lazy } from "react";
import useBusinessData from "../store/useBusinessData";

const ChatHotel = lazy(() => import("./ChatHotel"));
const ReviewUsersHotel = lazy(() => import("./reviewUsersHotel"));

const MemoBookedRoomHotel = () => {
    const outletInfo = useBusinessData((s)=>s.outletInfo);
    const { setOpenRoomModal, roomData, setIsOpenChat, isOpenChat } = useHotelStore();
    const { checkOut } = useCheckOut();
    const handleCopyAuthCode = () => {
        navigator.clipboard.writeText(roomData?.authCode)
    }
    const { mutateAsync, isPending } = useMutation({
        mutationFn: checkOut,
    })
    const handleCheckOut = async () => {
        mutateAsync()
    }
    const handleChat = () => {
        setIsOpenChat(!isOpenChat)
    }

    return (
        <section className="w-full h-[90dvh] overflow-y-auto bg-white">
            {isOpenChat ? <ChatHotel
                hotelName={outletInfo?.name || ""}
                logo={outletInfo?.logoUrl || ""}
                room={roomData?.name}
                businessId={outletInfo?.businessId}
            /> : <>
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">
                    <header className="text-center">Room {roomData?.name}</header>
                    <header onClick={handleChat} className="cursor-pointer text-center text-base -mt-8 float-right">
                        <MessageCircleMore color="green" /> Chat
                    </header>
                </CardTitle>
            </CardHeader>
            <center className="flex justify-around items-center gap-2 text-sm text-black">
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
            <div className="mx-4 my-3 rounded-md bg-white p-3 border shadow-sm">
                <div className="text-sm font-medium text-black mb-1 flex items-center">
                    <Key className="h-4 w-4 mr-1" />
                    Room Access Code
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold tracking-wider text-blue-700">{roomData?.authCode}</div>
                    <Button size="sm" variant="outline" className="h-8 px-2 border-blue-200" onClick={handleCopyAuthCode}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                    </Button>
                </div>
            </div>

            {/* Guest Information */}
            <CardContent className="pb-2 -mx-2 ">
                <div className="space-y-3 border p-2 rounded-md bg-white">
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
                        className: 'rounded-md pl-3',
                    },
                    {
                        text: 'Check out',
                        onClick: handleCheckOut,
                        className: 'rounded-md shadow-md text-white',
                        disable: isPending,
                        swipe: true,
                    },
                ]}
            />
            </>}
        </section>
    )
}
const BookedRoomHotel = memo(MemoBookedRoomHotel)
export default BookedRoomHotel

