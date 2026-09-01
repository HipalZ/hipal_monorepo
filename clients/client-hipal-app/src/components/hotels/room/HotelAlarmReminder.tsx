"use client";

import { useCallback, useState } from "react";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { AlarmClock, CalendarClock, X } from "lucide-react";
import toast from "react-hot-toast";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { hasGuestContactDetails } from "./guestContactGuard";

type WakeUpRequest = {
  id: string;
  triggerAt?: string;
  wakeUpAt?: number;
  displayTime?: string;
  note: string;
  status?: "REQUESTED" | "ACKNOWLEDGED" | "DUE" | "INFORMED" | "CANCELLED";
  alertProgress?: string;
  acceptedAt?: number;
  acceptedBy?: {
    name?: string;
    phone?: string;
  } | null;
  deliveredAt?: number;
  deliveredBy?: {
    name?: string;
    phone?: string;
  } | null;
};

interface HotelAlarmReminderProps {
  businessId: string;
  room?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

const MAX_ACTIVE_REQUESTS = 1;

const getDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const getTimeInputValue = (date: Date) => date.toTimeString().slice(0, 5);

function formatWakeUpTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getWakeUpTimeLabel(request: WakeUpRequest) {
  if (request.triggerAt) {
    return formatWakeUpTime(request.triggerAt);
  }

  if (request.wakeUpAt) {
    return formatWakeUpTime(new Date(request.wakeUpAt).toISOString());
  }

  return request.displayTime || "Wake-up call requested";
}

function isActiveWakeUp(request: WakeUpRequest) {
  return ["REQUESTED", "ACKNOWLEDGED", "DUE"].includes(
    request.status || "REQUESTED"
  );
}

function getStatusLabel(request: WakeUpRequest) {
  if (request.status === "INFORMED") return "Guest informed";
  if (request.status === "CANCELLED") return "Cancelled";
  if (request.status === "DUE") return "Wake-up due now";
  if (request.status === "ACKNOWLEDGED" || request.acceptedBy?.name) {
    return request.acceptedBy?.name
      ? `Acknowledged by ${request.acceptedBy.name}. Front office will remind you.`
      : "Acknowledged by front office.";
  }
  return "Waiting for front office acknowledgement.";
}

export default function HotelAlarmReminder({
  businessId,
  room,
  triggerClassName,
  triggerLabel,
}: HotelAlarmReminderProps) {
  const userDetails = useLogin((s) => s.userDetails);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const [showPopup, setShowPopup] = useState(false);
  const [wakeDate, setWakeDate] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [note, setNote] = useState("Remind Me");
  const [saving, setSaving] = useState(false);
  const canFetchWakeUps =
    showPopup &&
    hasGuestContactDetails(userDetails) &&
    Boolean(businessId && room);

  const resetForm = useCallback(() => {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    setWakeDate(getDateInputValue(nextHour));
    setWakeTime(getTimeInputValue(nextHour));
    setNote("Wake-up call");
  }, []);

  const requireGuestDetails = useCallback(() => {
    if (hasGuestContactDetails(userDetails)) return true;

    toast("Please add your name and phone number to continue.");
    setCheckLogin(true);
    return false;
  }, [setCheckLogin, userDetails]);

  const handleOpen = useCallback(() => {
    if (!requireGuestDetails()) return;
    resetForm();
    setShowPopup(true);
  }, [requireGuestDetails, resetForm]);

  const createWakeUpRequest = async (request: WakeUpRequest) => {
    const response = await apiRpc.hotel.alarm.create_alarm.$post({
      json: {
        businessId,
        userId: userDetails?._id || "",
        guestName: userDetails?.name || "Guest",
        guestPhone: userDetails?.phone || "",
        roomName: room || "",
        triggerAt: request.triggerAt || "",
        note: request.note,
        notifyFrontOffice: true,
      },
    });

    return response.json();
  };

  const { data: requests = [], refetch: refetchWakeUps } = useQuery<
    WakeUpRequest[]
  >({
    queryKey: ["hotel-wake-up-calls", businessId, room, userDetails?._id],
    enabled: canFetchWakeUps,
    refetchInterval: canFetchWakeUps ? 10000 : false,
    refetchIntervalInBackground: false,
    queryFn: async (): Promise<WakeUpRequest[]> => {
      const response = await apiRpc.hotel.alarm.active.$get({
        query: {
          businessId,
          userId: userDetails?._id || "",
          roomName: room || "",
        },
      });
      const result = await response.json();

      if (result?.err || !Array.isArray(result?.data)) {
        return [];
      }

      return (result.data as WakeUpRequest[]).map((item) => ({
        id: item.id,
        note: item.note || "Wake-up call",
        wakeUpAt: item.wakeUpAt,
        displayTime: item.displayTime,
        status: item.status,
        alertProgress: item.alertProgress,
        acceptedAt: item.acceptedAt,
        acceptedBy: item.acceptedBy,
        deliveredAt: item.deliveredAt,
        deliveredBy: item.deliveredBy,
      }));
    },
  });

  const activeRequests = requests.filter(isActiveWakeUp);
  const historyRequests = requests.filter(
    (request) => !isActiveWakeUp(request)
  );

  const handleConfirm = async () => {
    if (!requireGuestDetails()) return;

    const triggerAt = new Date(`${wakeDate}T${wakeTime}`);
    if (
      Number.isNaN(triggerAt.getTime()) ||
      triggerAt.getTime() <= Date.now()
    ) {
      toast.error("Please select a future wake-up call time");
      return;
    }

    if (activeRequests.length >= MAX_ACTIVE_REQUESTS) {
      toast.error("Only one wake-up call can be active at a time");
      return;
    }

    const wakeUpRequest: WakeUpRequest = {
      id: `${Date.now()}`,
      triggerAt: triggerAt.toISOString(),
      note: note.trim() || "Wake-up call",
    };

    setSaving(true);
    try {
      const result = await createWakeUpRequest(wakeUpRequest);
      if (result?.err) {
        toast.error(result?.message || "Unable to send wake-up call request");
        return;
      }

      void refetchWakeUps();
      setShowPopup(false);
      resetForm();
      toast.success("Wake-up call request sent to front office.");
    } catch (error) {
      console.error("Wake-up call request failed:", error);
      toast.error("Unable to send wake-up call request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        size={triggerLabel ? "default" : "icon"}
        aria-label="Request wake-up call"
        className={cn(
          "relative h-11 w-11 rounded-full border border-white/70 text-white transition-all duration-300 hover:scale-[1.05] active:scale-95 plus-jakarta-font tracking-normal",
          triggerClassName
        )}
      >
        <AlarmClock size={18} />
        {triggerLabel && <span>{triggerLabel}</span>}
        {activeRequests.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white px-1 text-[0.68rem] font-bold leading-none">
            {activeRequests.length}
          </span>
        )}
      </Button>

      <BottomPopUp
        show={showPopup}
        hide
        onClose={() => setShowPopup(false)}
        height="auto"
        manageHistory={false}
      >
        <div className="plus-jakarta-font max-h-[86dvh] overflow-y-auto px-5 pb-24 pt-5 tracking-normal">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 text-[1.25rem] leading-tight tracking-normal text-[#2F2924]">
                Wake-up call
              </h2>
              <p className="mt-1 text-[0.82rem] font-medium leading-relaxed tracking-normal text-[#6B625A]">
                Send your requested call time to front office.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="rounded-full bg-[#F5F2EE] p-2 text-[#4A433D]"
              aria-label="Close wake-up call request"
            >
              <X size={18} />
            </button>
          </div>

          <section className="space-y-4">
            <div className="rounded-lg bg-[#F7F3EE] p-3 text-[#111111]">
              <div className="flex items-center gap-2 text-[0.86rem] font-bold tracking-normal text-[#2F2924]">
                <CalendarClock size={17} />
                Wake-up call time
              </div>
              <p className="mt-1 text-[0.75rem] font-medium leading-relaxed tracking-normal text-[#5A5048]">
                Staff will receive your room details and call time.
              </p>
              <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="wake-date"
                    className="text-[0.8rem] font-bold tracking-normal text-[#111111]"
                  >
                    Date
                  </Label>
                  <Input
                    id="wake-date"
                    type="date"
                    value={wakeDate}
                    min={getDateInputValue(new Date())}
                    onChange={(event) => setWakeDate(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-xl border-[#E1D8CE] bg-white px-2 text-[0.82rem] font-semibold tracking-normal text-[#111111] [color-scheme:light]"
                  />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="wake-time"
                    className="text-[0.8rem] font-bold tracking-normal text-[#111111]"
                  >
                    Time
                  </Label>
                  <Input
                    id="wake-time"
                    type="time"
                    value={wakeTime}
                    onChange={(event) => setWakeTime(event.target.value)}
                    className="h-11 w-full min-w-0 rounded-xl border-[#E1D8CE] bg-white px-2 text-[0.82rem] font-semibold tracking-normal text-[#111111] [color-scheme:light]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="wake-note"
                className="text-[0.85rem] font-bold tracking-normal text-[#111111]"
              >
                Wake-up note
              </Label>
              <Input
                id="wake-note"
                value={note}
                maxLength={80}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Example: airport pickup"
                className="h-11 rounded-xl border-[#E1D8CE] bg-white text-[0.88rem] font-semibold tracking-normal text-[#111111] placeholder:text-[#7A7168]"
              />
            </div>

            <div className="rounded-lg border border-[#E6DDD3] bg-white p-3">
              <p className="text-[0.88rem] font-bold tracking-normal text-[#2F2924]">
                Front office will be notified
              </p>
              <p className="mt-1 text-[0.76rem] font-medium leading-relaxed tracking-normal text-[#6B625A]">
                They can track, acknowledge, and mark the wake-up call as
                informed.
              </p>
            </div>

            {activeRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-[0.76rem] font-bold uppercase tracking-[0.12em] text-[#A79F97]">
                  Active wake-up call
                </p>
                {activeRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-md bg-[#F7F3EE] px-3 py-2"
                  >
                    <div>
                      <p className="text-[0.85rem] font-bold tracking-normal text-[#2F2924]">
                        {getWakeUpTimeLabel(request)}
                      </p>
                      <p className="text-[0.75rem] font-medium tracking-normal text-[#6B625A]">
                        {request.note}
                      </p>
                      <p
                        className={`mt-1 text-[0.72rem] font-bold tracking-normal ${
                          request.status === "DUE"
                            ? "text-[#C2410C]"
                            : request.acceptedBy?.name
                            ? "text-[#198754]"
                            : "text-[#A46A23]"
                        }`}
                      >
                        {getStatusLabel(request)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {historyRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-[0.76rem] font-bold uppercase tracking-[0.12em] text-[#A79F97]">
                  Wake-up call history
                </p>
                {historyRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-md border border-[#E6DDD3] bg-white px-3 py-2"
                  >
                    <p className="text-[0.85rem] font-bold tracking-normal text-[#2F2924]">
                      {getWakeUpTimeLabel(request)}
                    </p>
                    <p className="text-[0.75rem] font-medium tracking-normal text-[#6B625A]">
                      {request.note}
                    </p>
                    <p className="mt-1 text-[0.72rem] font-bold tracking-normal text-[#198754]">
                      {getStatusLabel(request)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <CommonBottomButton
          fixed={false}
          buttons={[
            {
              text: "Send wake-up call request",
              onClick: handleConfirm,
              isLoading: saving,
              disable: saving || activeRequests.length >= MAX_ACTIVE_REQUESTS,
              className: "rounded-md",
            },
          ]}
        />
      </BottomPopUp>
    </>
  );
}
