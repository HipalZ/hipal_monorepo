"use client";
import type React from "react"
import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import Welcome from "@/assets/hotel/HotelWelcome.json"
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import CommonBottomButton from "@/components/atoms/bottomButton"
import { KeyRound, MessageSquare, AlertCircle, Utensils, Bell, Wifi, Coffee } from "lucide-react";
import { useMutation } from "@tanstack/react-query"
import { apiRpc } from "@hi/common"
import LoadingSpinnerCircle from "@/components/atoms/loader"
import { toast } from "react-toastify"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export interface HotelWelcomeCardProps {
    hotelName: string
    logo: string
    room?: string
    className?: string
    businessId?: string
    customLink?: string
}

export default function HotelWelcomeCard({
    hotelName = "Hi Palz",
    logo,
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
                            <Card className="mx-auto">
                                <CardContent className="p-0">
                                    {/* Logo and Welcome Section */}
                                    <div className="bg-gradient-to-b from-blue-50 to-white pt-6 pb-4 px-6 rounded-t-lg">
                                        <div className="flex justify-center mb-4">
                                            <Image src={logo || ""} alt={`${hotelName} Logo`} width={120} height={120} className="object-contain" />
                                        </div>

                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <h2 className="text-2xl font-bold text-center text-blue-800 mb-2">Welcome to {hotelName}</h2>
                                            <p className="text-center text-blue-600 mb-4">We're delighted to have you as our guest</p>
                                        </motion.div>
                                    </div>

                                    {/* Services Preview */}
                                    <div className="px-6 py-4 bg-white border-y border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your stay includes:</h3>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Wifi className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">High-Speed WiFi</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Utensils className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">Room Service</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Bell className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">24/7 Assistance</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Coffee className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">Breakfast</span>
                                            </div>
                                        </div>

                                        <p className="text-sm italic text-center">
                                            Verify your room to unlock all services and amenities
                                        </p>
                                    </div>

                                    {/* Verification Section */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                            <MessageSquare className="w-4 h-4 flex-shrink-0" />
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
                                                    className="w-full p-3 pl-12 text-xl text-black font-bold tracking-widest text-center border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
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
                                </CardContent>
                            </Card>
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

