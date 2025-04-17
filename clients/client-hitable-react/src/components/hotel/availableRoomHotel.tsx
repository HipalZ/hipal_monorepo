import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { FaGlobe } from "react-icons/fa";
import { Input } from "../ui/input"
import { memo, useCallback, useState } from "react";
import { Phone, User, BedDouble } from "lucide-react";
import { useCheckIn, useGetRoom } from "@/hooks/useHotelApis";
import { useHotelStore } from "../store/useHotelStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CommonBottomButton from "../atoms/bottomButton"
import QRCode from "react-qr-code";
import toast from "react-hot-toast"
import { Button } from "../ui/button";
import useBusinessData from "../store/useBusinessData";

export const sources = [
    "Corporate",
    "Online Travel Agent",
    "Hotel Website",
    "Free Individual Traveler",
    "Other"
]
const MemoAvailableRoomHotel = () => {
    const { roomData, setOpenRoomModal, guestName, setGuestName, phoneNumber, setPhoneNumber, selectedSource, setSelectedSource } = useHotelStore();
    const [customSource, setCustomSource] = useState("");
    const businessId = useBusinessData((s) => s.outletInfo?.businessId)
    const [isCustomSource, setIsCustomSource] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const { checkIn } = useCheckIn();
    const { getRoom } = useGetRoom(roomData?._id)
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
    }, [setOpenRoomModal, queryClient])

    const handleSources = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "Other") {
            setIsCustomSource(true);
            setSelectedSource(customSource || "");
        } else {
            setIsCustomSource(false);
            setSelectedSource(value);
            setCustomSource("");
        }
    }, [customSource, setSelectedSource]);

    const handleCustomSourceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomSource(value);
        setSelectedSource(value);
    }, [setSelectedSource]);

    const handleShowStatus = useCallback(() => {
        setLoadingStatus(!loadingStatus);
    }, [loadingStatus]);

    useQuery({
        queryKey: ["roomData", roomData?._id],
        queryFn: getRoom,
        enabled: !!businessId && !!roomData?._id && loadingStatus,
        refetchInterval: 10000,
    })

    return (
        <section className="w-full mx-auto bg-white min-h-[90dvh] pb-20">
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
                <article>
                    <h1 className="flex items-center gap-2">
                        <FaGlobe className="h-4 w-4" />
                        Source of Booking
                    </h1>
                    <p className="text-sm text-gray-500">Select the source of booking for this guest</p>
                </article>
                <select
                    value={isCustomSource ? "Other" : selectedSource}
                    onChange={handleSources}
                    className="w-full border border-black rounded-md p-2"
                    aria-label="Select Source"
                >
                    <option value="" disabled>Select Source</option>
                    {sources.map((source) => (
                        <option key={source} value={source}>
                            {source}
                        </option>
                    ))}
                </select>
                {isCustomSource && (
                    <Input
                        className="mt-2 border-black"
                        placeholder="Enter custom source"
                        value={customSource}
                        maxLength={30}
                        onChange={handleCustomSourceChange}
                    />
                )}
                <center className="space-y-2 relative">
                    <h1>(or)</h1>
                    <h1 className="text-center text-gray-700 text-lg font-medium mb-2">Scan QR to check-in</h1>

                    <div className="relative inline-block">
                        <QRCode value={roomData?.downLoadLink || ""} size={180} />
                        {loadingStatus && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
                                <div className="h-6 w-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <p className="text-gray-700 text-sm mt-2">Powered by Hipalz</p>
                    <Button size="sm" onClick={handleShowStatus} className="flex items-center mb-4">
                        {loadingStatus ? "Hide Status" : "Show Status"}
                    </Button>
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