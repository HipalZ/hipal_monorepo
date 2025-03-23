"use client";
import type React from "react"
import { useState, useEffect } from "react"
import Lottie from "lottie-react"
import Welcome from "@/assets/hotel/HotelWelcome.json"
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import CommonBottomButton from "@/components/atoms/bottomButton"
import { useMutation } from "@tanstack/react-query"
import { apiRpc } from "@hi/common"
import LoadingSpinnerCircle from "@/components/atoms/loader"
import { toast } from "react-toastify"

import { useUserToken } from "@hi/common/src/useUserToken";
import CheckInPopup from "./CheckInPopup";
import AutoLogin from "./AutoLogin";

export interface HotelWelcomeCardProps {
    hotelName: string
    logo: string
    room?: string
    className?: string
    businessId?: string
    customLink?: string
    userID?: string
}

export default function HotelWelcomeCard({
    hotelName = "Hi Palz",
    logo,
    customLink,
    className,
    room,
    businessId,
    userID,
}: HotelWelcomeCardProps) {
    const [showPopup, setShowPopup] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [codeError, setCodeError] = useState("")
    const accessToken = useUserToken.getState().accessToken;

    const { checkRoom } = useCheckRoomStatus(businessId || "", room || "", customLink)

    useEffect(() => {
        if (accessToken !== "" && (checkRoom?.status === 400 || checkRoom?.status === 401 ||
            checkRoom?.status === 403)) {
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
            {
                accessToken === "" && userID && (
                  <AutoLogin userID={userID} />
                )
            }

            {showPopup && (
                <BottomPopUp hide show={showPopup} onClose={handleClosePopup}>
                    {
                        isPending ? <LoadingSpinnerCircle /> :
                            <CheckInPopup
                                codeError={codeError}
                                handleCodeChange={handleCodeChange}
                                hotelName={hotelName}
                                logo={logo}
                                verificationCode={verificationCode}
                            />

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

