"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUserToken } from "@hi/common/src/useUserToken";
import CheckInPopup from "./CheckInPopup";
import AutoLogin from "./AutoLogin";

export interface HotelWelcomeCardProps {
  hotelName: string;
  logo: string;
  room?: string;
  className?: string;
  businessId?: string;
  customLink?: string;
  userID?: string;
  sessionId?: string;
}

export default function HotelWelcomeCard({
  hotelName = "Hi Palz",
  logo,
  customLink,
  className,
  room,
  businessId,
  userID,
  sessionId,
}: HotelWelcomeCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const accessToken = useUserToken.getState().accessToken;
    const router = useRouter();
  const { checkRoom } = useCheckRoomStatus(
    businessId || "",
    room || "",
    customLink,
    userID,
  );

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const checkSessionIsActive = async (sessionId: string) => {
    if (!sessionId) {
      return;
    }
    const response = await apiRpc.hotel.rooms.fetch_room_session.$get({
      query: {
        sessionId: sessionId || "",
      },
    });
    if (response.status === 200 || response.status === 201) {
      return response;
    }
    if (response.status === 404) {
      toast.error("Session expired. Please login again.");
      router.push("/");
      return;
    }
    if (response.status === 400 || response.status === 401) {
      toast.error("Session is not valid. Please login again.");
      router.push("/");
      return;
    }
    return response;
  };

  const { isLoading: checkingSession } = useQuery({
    queryKey: ["checkSession", sessionId],
    queryFn: () => checkSessionIsActive(sessionId),
    enabled: !!sessionId,
  });

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

  return (
    <>
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
