import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input"
import { memo, useCallback, useState } from "react";
import { Phone, User, BedDouble } from "lucide-react";
import { useCheckIn } from "@/hooks/useHotelApis";
import { useHotelStore } from "../store/useHotelStore"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CommonBottomButton from "../atoms/bottomButton"
import toast from "react-hot-toast"
import QRCode from "react-qr-code";

const MemoAvailableRoomHotel = () => {
    const { roomData, setOpenRoomModal, guestName, setGuestName, phoneNumber, setPhoneNumber } = useHotelStore();
    const { checkIn } = useCheckIn();
    const queryClient = useQueryClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Simple validation
    const isValidName = guestName.trim().length >= 3
    const isValidPhone = /^\+?[0-9]{10,15}$/.test(phoneNumber)
    const isFormValid = isValidName && isValidPhone

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and + sign
        const value = e.target.value.replace(/[^\d+]/g, "")
        setPhoneNumber(value)
    }, [setPhoneNumber])

    const { isPending,
        mutateAsync
    } = useMutation({
        mutationFn: checkIn,
    })

    const handleSubmit = async () => {
        if (!isFormValid) {
            toast.error("Invalid Information")
            return
        }
        setIsSubmitting(true)
        try {
            mutateAsync()
        } catch (error) {
            toast.error("Failed to register guest")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = useCallback(() => {
        setOpenRoomModal(false)
        queryClient.invalidateQueries({
            queryKey: ["allRooms"],
        })
    },[setOpenRoomModal, queryClient])

    return (
        <section className="w-full mx-auto bg-white min-h-[90dvh]">
            <CardHeader className="space-y-4">
                <CardTitle className="text-2xl">
                    <header className="text-center flex items-center justify-center gap-2">
                        <BedDouble className="h-6 w-6 text-green-600" />
                        Room {roomData?.name}
                    </header>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h1 className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Primary Guest Name
                    </h1>
                    <Input
                        id="guestName"
                        placeholder="Enter Guest Name"
                        value={guestName}
                        maxLength={30}
                        onChange={(e) => setGuestName(e.target.value)}
                        className={`border-black ${!guestName || isValidName ? "" : "border-red-500"}`}
                    />
                    {guestName && !isValidName && <p className="text-xs text-red-500">Name must be at least 3 characters</p>}
                </div>
                <div className="space-y-2">
                    <h1 className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                    </h1>
                    <Input
                        id="phoneNumber"
                        placeholder="Enter Phone Number"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        type="tel"
                        maxLength={10}
                        className={`border-black ${!phoneNumber || isValidPhone ? "" : "border-red-500"}`}
                    />
                    {phoneNumber && !isValidPhone && <p className="text-xs text-red-500">Please enter a valid phone number</p>}
                </div>
                <center className="space-y-">
                    <span>(or)</span>
                    <h1 className="text-center text-gray-700 text-lg font-medium mb-2">Scan QR to check-in</h1>
                    <QRCode value={roomData?.downLoadLink || ""} size={180} />
                    <p className="text-gray-700 text-sm mt-2">Powered by Hipalz</p>
                </center>
            </CardContent>
            <CommonBottomButton
                maxWidth="30rem"
                position="mid"
                fixed
                shadow
                buttons={[
                    {
                        text: "",
                        isBackButton: true,
                        onClick: handleBack,
                        className: "rounded-md pl-3",
                    },
                    {
                        text: "Register Guest",
                        onClick: handleSubmit,
                        className: "rounded-md shadow-md",
                        disable: !isFormValid || isSubmitting || isPending,
                    },
                ]}
            />
        </section>
    )
}

const AvailableRoomHotel = memo(MemoAvailableRoomHotel)
export default AvailableRoomHotel