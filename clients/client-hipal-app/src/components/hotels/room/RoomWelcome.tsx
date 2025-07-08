"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { toast } from "react-toastify";

import { useUserToken } from "@hi/common/src/useUserToken";
import CheckInPopup from "./CheckInPopup";
import AutoLogin from "./AutoLogin";
import { useLogin } from "@/components/store/useLogin";

export interface HotelWelcomeCardProps {
  hotelName: string;
  logo: string;
  room?: string;
  className?: string;
  businessId?: string;
  customLink?: string;
  userID?: string;
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
  const [showPopup, setShowPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const accessToken = useUserToken.getState().accessToken;
  const guestName = useLogin((s) => s.userDetails?.name);
  const { checkRoom } = useCheckRoomStatus(
    businessId || "",
    room || "",
    customLink,
    userID,
  );

  useEffect(() => {
    if (
      accessToken !== "" &&
      (checkRoom?.status === 400 ||
        checkRoom?.status === 401 ||
        checkRoom?.status === 403)
    ) {
      setShowPopup(true);
    }
  }, [checkRoom]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRpc.hotel.rooms.verify_authcode.$post({
        json: {
          authCode: code,
          userId: userID,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.status === 400) {
        toast.error("Invalid code");
        return setCodeError(data.message || "Invalid code");
      }
      if (data.status === 401 || data.status === 403) {
        toast.error("Unauthorized");
        return setCodeError(data.message || "Unauthorized");
      }
      if (data.status === 200) {
        toast.success("Checked in successfully");
        setShowPopup(false);
      }
    },
  });
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    ///^[a-zA-Z0-9]*$/.test(value) &&
    if (value.length <= 4) {
      setVerificationCode(value);
      setCodeError("");
    }
  };

  const handleCheckIn = () => {
    if (verificationCode.length !== 4) {
      setCodeError("Please enter a 4-digit code");
      return;
    }
    mutateAsync(verificationCode);
  };

  return (
    <>
      <div
        className={`relative w-full px-4 mt-2 overflow-hidden ${
          className || ""
        }`}
      >
        <center>
          <h2 className="text-xl text-h-primary text-center inter">
            Welcome, {guestName}!
          </h2>
        </center>
      </div>
      {accessToken === "" && userID && <AutoLogin userID={userID} />}

      {showPopup && (
        <BottomPopUp hide show={showPopup} onClose={handleClosePopup}>
          {isPending ? (
            <LoadingSpinnerCircle />
          ) : (
            <CheckInPopup
              codeError={codeError}
              handleCodeChange={handleCodeChange}
              hotelName={hotelName}
              logo={logo}
              verificationCode={verificationCode}
            />
          )}
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
  );
}
