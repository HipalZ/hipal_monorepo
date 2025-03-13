"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import Welcome from "@/assets/hotel/HotelWelcome.json"
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import CommonBottomButton from "@/components/atoms/bottomButton"
import { KeyRound, MessageSquare, AlertCircle, ShieldCheck, Hotel } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { apiRpc } from "@hi/common"
import LoadingSpinnerCircle from "@/components/atoms/loader"
import { toast } from "react-toastify"

interface HotelWelcomeCardProps {
    hotelName: string
    room?: string
    className?: string
    businessId?: string
    customLink: string
}

export default function HotelWelcomeCard({
    hotelName = "Hi Palz",
    customLink,
    className,
    room,
    businessId,
}: HotelWelcomeCardProps) {
    const [showPopup, setShowPopup] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [codeError, setCodeError] = useState("")

    const { checkingIn, checkRoom } = useCheckRoomStatus(businessId || "", room || "", customLink)

    useEffect(() => {
        if (checkRoom?.status === 400 || checkRoom?.status === 401 ||
            checkRoom?.status === 403) {
            setShowPopup(true)
        }
    }, [checkRoom])

    const handleClosePopup = () => {
        setShowPopup(false)
    }


    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (code: string) => {
            const response = await apiRpc.hotel.rooms.verify_authcode.$post({
                json: {
                    authCode: code,
                }
            })
            return response
        },
        onSuccess: (data) => {
            if (data.status === 400) {
                toast.error("Invalid code")
                return setCodeError(data.message || "Invalid code")

            }
            if (data.status === 401 || data.status === 403) {
                toast.error("Unauthorized")
                return setCodeError(data.message || "Unauthorized")
            }
            if (data.status === 200) {
                toast.success("Checked in successfully")
                setShowPopup(false)
            }
        },
    })
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        ///^[a-zA-Z0-9]*$/.test(value) &&
        if (value.length <= 4) {
            setVerificationCode(value)
            setCodeError("")
        }
    }

    const handleCheckIn = () => {
        if (verificationCode.length !== 4) {
            setCodeError("Please enter a 4-digit code")
            return
        }
        mutateAsync(verificationCode)
    }

    return (
        <>
            <div
                className={`relative w-full max-w-[30rem] h-[180px] bg-h-base-100 px-4 rounded-lg overflow-hidden flex ${className || ""}`}
            >
                <div className="w-[30%] h-full flex items-center justify-center">
                    <Lottie animationData={Welcome} loop={true} style={{ width: "100%", height: "100%" }} />
                </div>

                <div className="w-[70%] h-full flex flex-col justify-center p-4 text-h-primary">
                    <h2 className="text-xl font-semibold text-center">Welcome to</h2>
                    <div className="mb-2 text-2xl font-bold text-center bungee-inline">{hotelName}</div>
                    <p className="pl-4 text-sm font-semibold text-center opacity-60">
                        Please feel free to reach out for anything. We value your feedback.
                    </p>
                </div>
            </div>

            {showPopup && (
                <BottomPopUp hide show={showPopup} onClose={handleClosePopup}>
                    {
                        isPending ? <LoadingSpinnerCircle /> :
                            <div className="p-4 text-center text-h-primary">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 rounded-full bg-blue-50">
                                        <ShieldCheck className="w-10 h-10 text-blue-500" />
                                    </div>
                                </div>

                                <h3 className="flex items-center justify-center gap-2 mb-2 text-lg font-bold">
                                    <Hotel className="w-5 h-5" />
                                    Room Verification
                                </h3>

                                <p className="mb-4">Please enter the 4-digit verification code to check in to your room.</p>

                                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                                    <MessageSquare className="w-4 h-4" />
                                    <p>The code was sent to you via WhatsApp. If you haven't received it, please contact the reception.</p>
                                </div>

                                <div className="mb-6">
                                    <div className="relative">
                                        <KeyRound className="absolute text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={handleCodeChange}
                                            placeholder="Enter 4-digit code"
                                            className="w-full p-3 pl-12 text-xl font-bold tracking-widest text-center border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                            maxLength={4}
                                        />
                                    </div>
                                    {codeError && (
                                        <p className="flex items-center justify-center gap-1 mt-2 text-sm text-red-500">
                                            <AlertCircle className="w-4 h-4" />
                                            {codeError}
                                        </p>
                                    )}
                                </div>
                            </div>
                    }
                    <CommonBottomButton
                        fixed={true}
                        buttons={[

                            {
                                text: "Check In",
                                onClick: handleCheckIn,
                                className: "w-full rounded-md",
                                isLoading: isPending,
                            },
                        ]}
                    />
                </BottomPopUp>
            )}
        </>
    )
}

