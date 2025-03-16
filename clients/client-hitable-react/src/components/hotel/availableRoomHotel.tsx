import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input"
import { memo, useState } from "react";
import { Phone, User, BedDouble, PhoneIcon as WhatsappLogo } from "lucide-react";
import { useCheckIn } from "@/hooks/useHotelApis";
import { useHotelStore } from "../store/useHotelStore"
import { useMutation } from "@tanstack/react-query";
import CommonBottomButton from "../atoms/bottomButton"
import toast from "react-hot-toast"

const MemoAvailableRoomHotel = () => {
    const { roomData, setOpenRoomModal, guestName, setGuestName, phoneNumber, setPhoneNumber } = useHotelStore();
    const { checkIn } = useCheckIn();
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Simple validation
    const isValidName = guestName.trim().length >= 3
    const isValidPhone = /^\+?[0-9]{10,15}$/.test(phoneNumber)
    const isFormValid = isValidName && isValidPhone

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and + sign
        const value = e.target.value.replace(/[^\d+]/g, "")
        setPhoneNumber(value)
    }

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
    return (
        <section className="w-full mx-auto">
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
                {/* WhatsApp Service Section */}
                <div className="transform transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg border-2 border-green-100 bg-gradient-to-r from-green-50 to-green-100">
                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                                    <WhatsappLogo className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-green-800">WhatsApp Services</h3>
                                    <p className="text-xs text-green-600">Instant updates & notifications</p>
                                </div>
                            </div>

                            <div className="pl-10 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Room service requests
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Housekeeping updates
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Important notifications
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                        onClick: () => setOpenRoomModal(false),
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