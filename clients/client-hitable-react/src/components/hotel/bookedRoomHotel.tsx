import { Badge } from "@/components/ui/badge";
import {
  BedDouble,
  BedSingle,
  Key,
  Star,
  MessageCircleMore,
  ArrowRight,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCheckOut,
  useCreateAlert,
  useUpdateSource,
} from "@/hooks/useHotelApis";
import { useHotelStore } from "../store/useHotelStore";
import { useMutation } from "@tanstack/react-query";
import CommonBottomButton from "../atoms/bottomButton";
import { memo, lazy, useCallback, useState } from "react";
import useBusinessData from "../store/useBusinessData";
import { Button } from "../ui/button";
import { sources } from "./availableRoomHotel";
import { Input } from "../ui/input";

import { useGetServiceCategories } from "../hooks/useServices.ts";
import CategorySearchModal from "./CategorySearchModal.tsx";
import { useHiClientZ } from "../store/useHiClientzData.ts";
import toast from "react-hot-toast";

const GuestInformation = lazy(() => import("./guestInformation"));
const ChatHotel = lazy(() => import("./ChatHotel"));
const ReviewUsersHotel = lazy(() => import("./reviewUsersHotel"));

const MemoBookedRoomHotel = () => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const setOpenRoomModal = useHotelStore((state) => state.setOpenRoomModal);
  const roomData = useHotelStore((state) => state.roomData);
  const isOpenChat = useHotelStore((state) => state.isOpenChat);
  const setIsOpenChat = useHotelStore((state) => state.setIsOpenChat);
  const { checkOut } = useCheckOut();
  const { updateSource } = useUpdateSource();
  const [selectedSource, setSelectedSource] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [isCustomSource, setIsCustomSource] = useState(false);
  const { creatingAlert, createAlert } = useCreateAlert();
  const userData = useHiClientZ((s) => s.captainData);

  // 🔽 NEW: state for services picker modal
  const [showServicePicker, setShowServicePicker] = useState(false);
  const businessId = outletInfo?.businessId || "";
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSource(value);
    setIsCustomSource(value === "Other");
  };

  const handleCustomSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSource(value);
    setSelectedSource(value);
  };

  const { mutateAsync: checkOutMutation, isPending } = useMutation({
    mutationFn: checkOut,
  });
  const updateSourceMutation = useMutation({
    mutationFn: updateSource,
  }).mutateAsync;

  const handleCheckOut = async () => {
    try {
      await checkOutMutation();
    } catch (error) {
      console.error("Check-out failed:", error);
    }
  };

  const handleUpdateSource = useCallback(async () => {
    try {
      await updateSourceMutation({
        source: selectedSource,
        roomId: roomData?._id,
      });
    } catch (error) {
      console.error("Update source failed:", error);
    }
  }, [roomData?._id, updateSourceMutation, selectedSource]);

  const handleChat = useCallback(() => {
    setIsOpenChat(!isOpenChat);
  }, [isOpenChat, setIsOpenChat]);

  // 🔽 NEW: open/close handlers for services modal
  const openServices = useCallback(() => setShowServicePicker(true), []);
  const closeServices = useCallback(() => setShowServicePicker(false), []);

  const createAlertHiclient = async (serviceIds: string[]) => {
    const result = await createAlert({
      serviceIds: serviceIds,
      businessId: businessId,
      roomId: roomData?._id || "",
      userId: userData?._id || "",
    });
    if (result.status === 200 || result.status === 201) {
      toast.success("Alert created successfully");
      closeServices();
    }
    console.log("Creating alert for service IDs:", serviceIds);
  };

  return (
    <section className="w-full">
      {isOpenChat ? (
        <ChatHotel
          hotelName={outletInfo?.name || ""}
          logo={outletInfo?.logoUrl || ""}
          room={roomData?.name}
          businessId={outletInfo?.businessId}
        />
      ) : (
        <section className="pb-[5rem]">
          <CardHeader className="space-y-4 pb-2">
            <CardTitle className="text-2xl">
              <header className="text-center">Room {roomData?.name}</header>
            </CardTitle>
          </CardHeader>

          <center className="flex justify-around items-center gap-2 text-sm text-black bg-white mx-4 py-1 rounded-lg">
            <Badge className="bg-blue-600">Booked</Badge>
            <span className="flex items-center gap-1">
              {roomData?.roomType === "SINGLE" ? (
                <BedSingle className="h-4 w-4" />
              ) : (
                <BedDouble className="h-4 w-4" />
              )}
              {roomData?.roomType}
            </span>
            <span>Capacity: {roomData?.capacity}</span>
            <div className="flex items-center ml-2">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1">{roomData?.rating}</span>
            </div>
          </center>

          {/* Auth Code Section - Highlighted */}
          <article className="mx-4 my-2 rounded-lg bg-white p-3 border shadow-sm text-sm font-medium text-black flex justify-between items-center">
            <span className="flex items-center">
              <Key className="h-4 w-4 mr-1" />
              Room Access Code
            </span>
            <div className="text-2xl font-bold tracking-wider text-blue-700">
              {roomData?.authCode}
            </div>
          </article>

          <article
            onKeyDown={(e) => {
              if (e.key === "Enter") handleChat();
            }}
            onClick={handleChat}
            className="m-4 rounded-lg bg-white p-3 border shadow-sm text-sm font-medium text-black flex justify-between items-center"
          >
            <span className="flex items-center">
              <MessageCircleMore className="h-4 w-4 mr-1" />
              Chat with us
            </span>
            <ArrowRight className="h-4 w-4" />
          </article>

          {/* 🔽 NEW: Services button */}
          <CardContent className="flex items-center gap-2 mx-4">
            <Button
              size="sm"
              className="h-9 rounded-lg shadow-md text-white"
              onClick={openServices}
              disabled={!businessId || categoriesLoading}
            >
              Services
            </Button>
            {categoriesLoading && (
              <span className="text-xs text-gray-500">Loading services…</span>
            )}
          </CardContent>

          {/* Guest Information */}
          <CardContent>
            <label className="text-sm font-medium text-gray-700">
              Source of Booking
            </label>
            <select
              value={isCustomSource ? "Other" : selectedSource}
              onChange={handleSourceChange}
              className="w-full border border-black rounded-md p-2 mt-1"
            >
              <option value="" disabled>
                Select Source
              </option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
            {isCustomSource && (
              <Input
                className="mt-2"
                placeholder="Enter custom source"
                value={customSource}
                onChange={handleCustomSourceChange}
              />
            )}
          </CardContent>

          <CardContent className="flex items-center gap-2 w-full">
            <span className="text-sm font-medium truncate w-full">
              {selectedSource || "No source selected"}
            </span>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleUpdateSource}
              disabled={!selectedSource}
            >
              Update
            </Button>
          </CardContent>

          <CardContent className="pb-2 -mx-2">
            <GuestInformation guests={roomData?.userIds} />
          </CardContent>

          <ReviewUsersHotel />

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
                className: "rounded-lg pl-3",
              },
              {
                text: "Check out",
                onClick: handleCheckOut,
                className: "rounded-lg shadow-md text-white",
                disable: isPending,
                swipe: true,
              },
            ]}
          />
        </section>
      )}

      {/* 🔽 NEW: Searchable services modal (multi-select + createAlert) */}
      {showServicePicker && categoriesData && categoriesData.length > 0 && (
        <CategorySearchModal
          show={showServicePicker}
          onClose={closeServices}
          categories={categoriesData}
          businessId={businessId}
          onConfirm={createAlertHiclient}
        />
      )}
    </section>
  );
};

const BookedRoomHotel = memo(MemoBookedRoomHotel);
export default BookedRoomHotel;
