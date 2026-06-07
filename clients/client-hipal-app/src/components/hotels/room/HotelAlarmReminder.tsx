"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRpc } from "@hi/common";
import { AlarmClock, CalendarClock, X } from "lucide-react";
import { toast } from "react-toastify";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/components/store/useLogin";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { hasGuestContactDetails } from "./guestContactGuard";

type WakeUpRequest = {
  id: string;
  triggerAt?: string;
  wakeUpAt?: number;
  displayTime?: string;
  note: string;
  acceptedAt?: number;
  acceptedBy?: {
    name?: string;
    phone?: string;
  } | null;
};

interface HotelAlarmReminderProps {
  businessId: string;
  room?: string;
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

export default function HotelAlarmReminder({ businessId, room }: HotelAlarmReminderProps) {
  const userDetails = useLogin((s) => s.userDetails);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const [showPopup, setShowPopup] = useState(false);
  const [requests, setRequests] = useState<WakeUpRequest[]>([]);
  const [wakeDate, setWakeDate] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [note, setNote] = useState("Remind Me");
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    setWakeDate(getDateInputValue(nextHour));
    setWakeTime(getTimeInputValue(nextHour));
    setNote("Wake-up call");
  }, []);

  const requireGuestDetails = useCallback(() => {
    if (hasGuestContactDetails(userDetails)) return true;

    toast.info("Please add your name and phone number to continue.");
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
        triggerAt: request.triggerAt,
        note: request.note,
        notifyFrontOffice: true,
      },
    });

    return response.json();
  };

  const fetchActiveWakeUps = useCallback(async () => {
    if (!hasGuestContactDetails(userDetails) || !businessId || !room) return;

    try {
      const response = await apiRpc.hotel.alarm.active.$get({
        query: {
          businessId,
          userId: userDetails._id,
          roomName: room,
        },
      });
      const result = await response.json();

      if (result?.err || !Array.isArray(result?.data)) return;

      setRequests(
        result.data.map((item: WakeUpRequest) => ({
          id: item.id,
          note: item.note || "Wake-up call",
          wakeUpAt: item.wakeUpAt,
          displayTime: item.displayTime,
          acceptedAt: item.acceptedAt,
          acceptedBy: item.acceptedBy,
        })),
      );
    } catch (error) {
      console.error("Unable to fetch active wake-up calls:", error);
    }
  }, [businessId, room, userDetails]);

  const handleConfirm = async () => {
    if (!requireGuestDetails()) return;

    const triggerAt = new Date(`${wakeDate}T${wakeTime}`);
    if (Number.isNaN(triggerAt.getTime()) || triggerAt.getTime() <= Date.now()) {
      toast.error("Please select a future wake-up call time");
      return;
    }

    if (requests.length >= MAX_ACTIVE_REQUESTS) {
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

      setRequests((current) => [
        ...current,
        {
          ...wakeUpRequest,
          id: result?.data?.alertId || wakeUpRequest.id,
        },
      ]);
      void fetchActiveWakeUps();
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

  useEffect(() => {
    if (!showPopup) return;

    void fetchActiveWakeUps();
    const interval = window.setInterval(fetchActiveWakeUps, 10000);

    return () => window.clearInterval(interval);
  }, [fetchActiveWakeUps, showPopup]);

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        size="icon"
        aria-label="Request wake-up call"
        className="relative h-11 w-11 rounded-full border border-white/70 bg-black text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-all duration-300 hover:scale-[1.05] hover:bg-[#1F1F1F] active:scale-95"
      >
        <AlarmClock size={18} />
        {requests.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#E85D3A] px-1 text-[0.68rem] font-bold leading-none">
            {requests.length}
          </span>
        )}
      </Button>

      <BottomPopUp show={showPopup} onClose={() => setShowPopup(false)} height="auto">
        <div className="max-h-[88dvh] overflow-y-auto px-5 pb-24 pt-5 poppins">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="poppins text-[0.72rem] font-semibold uppercase text-[#A79F97]">
                Front-office request
              </p>
              <h2 className="mt-1 poppins text-[1.32rem] font-bold leading-tight text-[#2F2924]">
                Wake-up call
              </h2>
              <p className="mt-1 poppins text-[0.82rem] leading-relaxed text-[#6B625A]">
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
              <div className="flex items-center gap-2 poppins text-[0.86rem] font-semibold text-[#2F2924]">
                <CalendarClock size={17} />
                Wake-up call time
              </div>
              <p className="mt-1 poppins text-[0.76rem] leading-relaxed text-[#5A5048]">
                Staff will receive your room details and call time.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="wake-date" className="poppins text-[#111111]">Date</Label>
                  <Input
                    id="wake-date"
                    type="date"
                    value={wakeDate}
                    min={getDateInputValue(new Date())}
                    onChange={(event) => setWakeDate(event.target.value)}
                    className="poppins border-[#E1D8CE] bg-[#F7F3EE] text-[#111111] [color-scheme:light]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wake-time" className="poppins text-[#111111]">Time</Label>
                  <Input
                    id="wake-time"
                    type="time"
                    value={wakeTime}
                    onChange={(event) => setWakeTime(event.target.value)}
                    className="poppins border-[#E1D8CE] bg-[#F7F3EE] text-[#111111] [color-scheme:light]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wake-note" className="poppins text-[#111111]">Wake-up note</Label>
              <Input
                id="wake-note"
                value={note}
                maxLength={80}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Example: airport pickup"
                className="poppins border-[#E1D8CE] bg-white text-[#111111] placeholder:text-[#7A7168]"
              />
            </div>

            <div className="rounded-lg border border-[#E6DDD3] bg-white p-3">
              <p className="poppins text-[0.88rem] font-semibold text-[#2F2924]">
                Front office will be notified
              </p>
              <p className="mt-1 poppins text-[0.76rem] leading-relaxed text-[#6B625A]">
                They can track and remove it after acknowledging.
              </p>
            </div>

            {requests.length > 0 && (
              <div className="space-y-2">
                <p className="poppins text-[0.76rem] font-semibold uppercase text-[#A79F97]">
                  Active wake-up calls
                </p>
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-md bg-[#F7F3EE] px-3 py-2"
                  >
                    <div>
                      <p className="poppins text-[0.85rem] font-semibold text-[#2F2924]">
                        {getWakeUpTimeLabel(request)}
                      </p>
                      <p className="poppins text-[0.75rem] text-[#6B625A]">{request.note}</p>
                      {request.acceptedBy?.name ? (
                        <p className="mt-1 poppins text-[0.72rem] font-semibold text-[#198754]">
                          Acknowledged by {request.acceptedBy.name}. Front office will remind you.
                        </p>
                      ) : (
                        <p className="mt-1 poppins text-[0.72rem] font-semibold text-[#A46A23]">
                          Waiting for front office acknowledgement.
                        </p>
                      )}
                    </div>
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
              disable: saving || requests.length >= MAX_ACTIVE_REQUESTS,
              className: "rounded-md",
            },
          ]}
        />
      </BottomPopUp>
    </>
  );
}
