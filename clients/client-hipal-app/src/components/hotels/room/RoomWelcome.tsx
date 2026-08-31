"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useCheckRoomStatus } from "@/components/hooks/useAuthForHotel";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUserToken } from "@hi/common/src/useUserToken";
import CheckInPopup from "./CheckInPopup";
import AutoLogin from "./AutoLogin";
import { useLogin } from "@/components/store/useLogin";

export interface HotelWelcomeCardProps {
  hotelName: string;
  logo: string;
  room?: string;
  businessId?: string;
  customLink?: string;
  userID?: string;
  sessionId?: string;
  contactPhone?: string;
}

export default function HotelWelcomeCard({
  hotelName = "Hi Palz",
  logo,
  customLink,
  room,
  businessId,
  userID,
  sessionId,
}: HotelWelcomeCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const accessToken = useUserToken((state) => state.accessToken);
  const userDetails = useLogin((state) => state.userDetails);
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeUserId = userDetails?._id || userID || "";
  const { checkRoom } = useCheckRoomStatus(
    businessId || "",
    room || "",
    customLink,
    activeUserId
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

  useQuery({
    queryKey: ["checkSession", sessionId],
    queryFn: () => checkSessionIsActive(sessionId),
    enabled: !!sessionId,
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRpc.hotel.rooms.verify_authcode.$post({
        json: {
          authCode: code,
          userId: activeUserId,
          businessId: businessId || "",
          room: room || "",
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
        queryClient.invalidateQueries({ queryKey: ["checkRoomStatus"] });
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
    if (!activeUserId) {
      setCodeError("Please login before entering the room code");
      return;
    }
    if (verificationCode.length !== 4) {
      setCodeError("Please enter a 4-digit code");
      return;
    }
    mutateAsync(verificationCode);
  };

  useEffect(() => {
    if (!activeUserId && checkRoom?.status === 401) {
      return;
    }

    if (activeUserId && checkRoom?.status === 403) {
      setShowPopup(true);
    }
  }, [activeUserId, checkRoom]);

  return (
    <>
      {accessToken === "" && userID && <AutoLogin userID={userID} />}

      {showPopup && (
        <BottomPopUp hide show={showPopup} onClose={handleClosePopup} manageHistory={false}>
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
