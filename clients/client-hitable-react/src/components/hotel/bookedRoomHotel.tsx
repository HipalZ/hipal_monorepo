import { Badge } from "@/components/ui/badge";
import {
  BedDouble,
  BedSingle,
  Key,
  Star,
  MessageCircleMore,
  ArrowRight,
  ConciergeBell,
  Loader2,
  Plus,
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
import { memo, lazy, useCallback, useEffect, useState } from "react";
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

  // Seed the dropdown from the room's saved source when the modal opens or the
  // room changes. Without this the select always started blank ("No source
  // selected") even though the room already had a source stored.
  useEffect(() => {
    const saved = roomData?.source || "";
    if (!saved) {
      setSelectedSource("");
      setIsCustomSource(false);
      setCustomSource("");
      return;
    }
    // A value not in the preset list is a custom source → "Other" + free text.
    const isPreset = sources.includes(saved);
    setSelectedSource(saved);
    setIsCustomSource(!isPreset);
    setCustomSource(isPreset ? "" : saved);
  }, [roomData?._id, roomData?.source]);

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
    onSuccess: (_data, variables: { source: string; roomId?: string }) => {
      // Commit the displayed source only after the API confirms the save.
      setSelectedSource(variables.source);
      toast.success("Source updated");
    },
    onError: () => toast.error("Failed to update source"),
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
    // Front office raises ON BEHALF OF THE GUEST, so the request carries the
    // room's current occupant — not the staff member. The occupancy guard then
    // passes (the guest is in the room) and the alert is attributed to the
    // guest, exactly as if they'd raised it themselves. A staff id would be
    // rejected as "not checked in to this room".
    const guestId = roomData?.userIds?.[0]?._id;
    if (!guestId) {
      toast.error("No guest is registered in this room. Register a guest before raising a request.");
      return;
    }
    const result = await createAlert({
      serviceIds: serviceIds,
      businessId: businessId,
      roomId: roomData?._id || "",
      userId: guestId,
      // Attributed to the guest (userId), but we also record which staff member
      // operated the front-office modal, so the report can show both.
      raisedByStaff: userData?._id,
    });
    if (result.status === 200 || result.status === 201) {
      toast.success("Request raised for the guest");
      closeServices();
    } else {
      toast.error(result?.data?.message || "Could not raise the request");
    }
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

          {/* Raise a service on the guest's behalf — a primary front-office
              action, so it reads as a full-width CTA, not a small pill. */}
          <button
            type="button"
            onClick={openServices}
            disabled={!businessId || categoriesLoading}
            aria-label="Raise a service request for this room"
            className="group m-4 flex w-[calc(100%-2rem)] items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 p-3.5 text-left text-white shadow-md transition-all hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              {categoriesLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ConciergeBell className="h-5 w-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-tight">
                {categoriesLoading ? "Loading services…" : "Raise a service request"}
              </span>
              <span className="block text-xs text-white/80">
                Order for the guest from the front desk
              </span>
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
              <Plus className="h-4 w-4" />
            </span>
          </button>

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
