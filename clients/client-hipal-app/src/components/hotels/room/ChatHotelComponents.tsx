import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEditGuestFoodOrder } from "@/components/hooks/useHotelRoom";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import type { Cart, ChatHeaderProps, RoomChat, RoomChatReply, Service } from "@/components/types/hotelTypes";
import { formatHotelTime } from "@/components/utils/helpersHotel";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import foodOrderImage from "@/assets/hotel/orderfood.jpeg";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  Minus,
  Package,
  Phone,
  Plus,
  Trash2,
  Utensils,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type RequestFilter = "all" | "pending" | "completed" | "rejected";

interface GuestSupportScreenProps {
  hotelName: string;
  logo: string;
  room: string;
  requests: RoomChat[];
  onClose: () => void;
  onReviewSubmit: (chatReplyId: string, rating: number) => Promise<void>;
  contactPhone?: string;
}

const ORDER_UPDATE_PREFIX = "Your order has been updated.";
const ORDER_REJECTED_PREFIX = "Sorry, your food order has been rejected";
const FEEDBACK_OPTIONS = [
  { id: "bad", label: "Bad", text: "\u{1F61E}", value: 1 },
  { id: "good", label: "Good", text: "\u{1F642}", value: 3 },
  { id: "happy", label: "Happy", text: "\u{1F60D}", value: 5 },
];

const formatDuration = (milliseconds?: number) => {
  if (!milliseconds || milliseconds <= 0) return "";
  const totalSeconds = Math.ceil(milliseconds / 1000);
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} min`;
};

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
};

const useNow = (enabled: boolean) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return now;
};

const getServices = (request: RoomChat) => request?.alertId?.serviceIds ?? [];

const getServiceNames = (services: Service[]) => {
  const names = services.map((service) => service?.name).filter(Boolean);
  if (!names.length) return "Service request";
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1} more`;
};

const getPrimaryServiceImage = (request: RoomChat) =>
  getServices(request).find((service) => service?.image)?.image;

const isFoodRequest = (request: RoomChat) => {
  const services = getServices(request);
  return (
    (request?.cart?.length ?? 0) > 0 ||
    services.some((service) => /food|order|restaurant|delivery/i.test(service?.name ?? ""))
  );
};

const getRequestTitle = (request: RoomChat) => {
  if (isFoodRequest(request)) {
    return `Food Order`;
  }

  return getServiceNames(getServices(request));
};

const getStatusMeta = (request: RoomChat) => {
  const progress = request?.alertId?.alertProgress;
  if (progress === "DELIVERED") {
    return {
      label: "Completed",
      detail: "Delivered",
      icon: CheckCircle2,
      pill: "bg-[#EAF5ED] text-[#23653D] ring-[#D4E8DA]",
      card: "border-[#DDEBE1] bg-[#F2F8F4]",
    };
  }
  if (progress === "REJECTED" || progress === "NOT_DELIVERED") {
    return {
      label: "Rejected",
      detail: "Unavailable",
      icon: XCircle,
      pill: "bg-[#FCEEEE] text-[#9B2D2D] ring-[#F3D2D2]",
      card: "border-[#F0D4D4] bg-[#FFF6F6]",
    };
  }
  if (progress === "ACCEPTED" || progress === "IS_ACCEPTED_AND_WARNING" || progress === "IS_ACCEPTED_AND_ESCALATION") {
    return {
      label: "Pending",
      detail: "Being processed",
      icon: Clock3,
      pill: "bg-[#FFF3D9] text-[#8A5A12] ring-[#EBD7AE]",
      card: "border-[#E9D9BC] bg-[#FFF9EB]",
    };
  }

  return {
    label: "Pending",
    detail: "Waiting for acceptance",
    icon: Clock3,
    pill: "bg-[#FFF3D9] text-[#8A5A12] ring-[#EBD7AE]",
    card: "border-[#E9D9BC] bg-[#FFF9EB]",
  };
};

const isRejectedRequest = (request: RoomChat) =>
  request?.alertId?.alertProgress === "REJECTED" ||
  request?.alertId?.alertProgress === "NOT_DELIVERED";

const isCompletedRequest = (request: RoomChat) =>
  request?.alertId?.alertProgress === "DELIVERED";

const isPendingRequest = (request: RoomChat) =>
  !isCompletedRequest(request) && !isRejectedRequest(request);

const getLatestReply = (request: RoomChat) => {
  const replies = request?.roomChatReplyIds ?? [];
  return replies[replies.length - 1];
};

const getReviewReplyId = (request: RoomChat) => {
  const replies = request?.roomChatReplyIds ?? [];
  return [...replies].reverse().find((reply) => reply?.action)?._id;
};

const hasSubmittedReview = (request: RoomChat) =>
  (request?.roomChatReplyIds ?? []).some((reply) => {
    const description = reply?.description ?? "";
    return (
      Boolean(reply?.reviewRating) ||
      /lovely feedback|glad you enjoyed|thank you for your feedback|we appreciate you helping us improve|sorry we missed|did not feel right/i.test(
        description
      )
    );
  });

const getCompletionDuration = (request: RoomChat) => {
  const acceptedAt = request?.alertId?.acceptedAt;
  const deliveredAt = request?.alertId?.deliveredAt || getLatestReply(request)?.date;
  if (!acceptedAt || !deliveredAt || request?.alertId?.alertProgress !== "DELIVERED") return "";
  return formatDuration(deliveredAt - acceptedAt);
};

const getRequestCode = (request: RoomChat) =>
  (request?.alertId?._id || request?._id || "----").slice(-4).toUpperCase();

const getTotalItems = (request: RoomChat) =>
  (request?.cart ?? []).reduce((sum: number, item: Cart) => sum + (item?.quantity || 1), 0);

const getCartItemTotal = (item: Cart) => {
  const itemPortion = (item as unknown as { portion?: { price?: number } | string | null })?.portion;
  const extrasTotal = (item?.extras ?? []).reduce(
    (sum: number, extra: { price?: number; quantity?: number }) =>
      sum + (Number(extra?.price) || 0) * (Number(extra?.quantity) || 1),
    0
  );
  const portionPrice =
    typeof itemPortion === "object" && itemPortion
      ? Number(itemPortion.price) || 0
      : 0;
  const unitPrice = portionPrice || Number(item?.dish?.price) || 0;
  return (unitPrice + extrasTotal) * (item?.quantity || 1);
};

const getEstimatedMinutes = (request: RoomChat) => {
  if (isFoodRequest(request)) {
    const longestFoodPrepTime = (request?.cart ?? []).reduce(
      (max: number, item: Cart) => Math.max(max, item?.dish?.avgPrepTime || 0),
      0
    );
    return longestFoodPrepTime || 30;
  }

  const services = getServices(request);
  return services.reduce(
    (max, service) =>
      Math.max(max, service?.avgCompletionTime || service?.avgDeliveryTime || 0),
    0
  );
};

const getEta = (request: RoomChat, now: number) => {
  const longestCompletion = getEstimatedMinutes(request);
  const totalMs = Math.max(longestCompletion, 1) * 60 * 1000;
  const start = request?.alertId?.acceptedAt || request?.alertId?.createdAt || request?.date || now;
  const expectedAt = start + totalMs;
  const rawRemainingMs = expectedAt - now;
  const remainingMs = Math.max(0, rawRemainingMs);
  const overdueMs = Math.max(0, now - expectedAt);
  const elapsedPercent = Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100));

  return {
    expectedAt,
    remainingMs,
    overdueMs,
    elapsedPercent,
    clock: formatCountdown(remainingMs),
  };
};

const getDeliveryPerformance = (request: RoomChat) => {
  const acceptedAt = request?.alertId?.acceptedAt;
  const deliveredAt = request?.alertId?.deliveredAt || getLatestReply(request)?.date;
  if (!acceptedAt || !deliveredAt) return null;

  const estimatedMs = Math.max(getEstimatedMinutes(request), 1) * 60 * 1000;
  const actualMs = deliveredAt - acceptedAt;
  return {
    early: actualMs <= estimatedMs,
    actualLabel: formatDuration(actualMs),
  };
};

const getOrderEditState = (
  request: RoomChat,
  editWindowMinutes: number,
  now: number
) => {
  const startedAt = request?.alertId?.createdAt || request?.date || 0;
  const editableUntil = startedAt + editWindowMinutes * 60 * 1000;
  const remainingMs = Math.max(0, editableUntil - now);
  const editable =
    isFoodRequest(request) &&
    isPendingRequest(request) &&
    editWindowMinutes > 0 &&
    remainingMs > 0;

  return { editable, editableUntil, remainingMs };
};

const getRejectionReasonText = (message: string) => {
  const normalizedMessage = message.replace(
    ORDER_REJECTED_PREFIX,
    "We couldn't process your food order."
  );
  const reasonMatch = normalizedMessage.match(/Reason:?-?\s*(.*?)(?:\.\s*Please|$)/i);
  return reasonMatch?.[1]?.trim() || normalizedMessage;
};

export const ChatHeader = ({ hotelName, logo, room, onClose, title, subtitle }: ChatHeaderProps) => (
  <section className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white px-4 py-3.5 text-slate-950 shadow-[0_1px_10px_rgba(15,23,42,0.05)] poppins-regular">
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      aria-label="Back to hotel home"
      className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-100"
    >
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
    </Button>
    <article className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar className="h-10 w-10 shrink-0 border border-slate-100 shadow-sm">
        <AvatarImage src={logo} alt={hotelName} className="object-cover" />
        <AvatarFallback className="bg-slate-100 text-sm  text-slate-700">
          {hotelName?.charAt(0) || "H"}
        </AvatarFallback>
      </Avatar>
      <aside className="min-w-0">
        <h1 className="line-clamp-1 text-[0.98rem]  leading-tight">{title || hotelName || "Guest support"}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {subtitle || `Room ${room || "--"} - Live support`}
        </p>
      </aside>
    </article>
  </section>
);

const StatusPill = ({ request }: { request: RoomChat }) => {
  const status = getStatusMeta(request);
  const Icon = status.icon;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.68rem]  ring-1 ${status.pill}`}>
      <Icon className="h-3.5 w-3.5" />
      {status.label}
    </span>
  );
};

const RequestListItem = ({ request, onSelect }: { request: RoomChat; onSelect: (request: RoomChat) => void }) => {
  const status = getStatusMeta(request);
  const Icon = Package;
  const isFood = isFoodRequest(request);
  const completion = getCompletionDuration(request);
  const itemCount = request?.cart?.reduce((sum: number, item: Cart) => sum + (item?.quantity || 1), 0) ?? 0;
  const requestImage = isFood ? foodOrderImage : getPrimaryServiceImage(request);
  const requestedAtText = `${isFood ? "Ordered" : "Raised"} at ${formatHotelTime(request?.date)}`;
  const requestSummaryText = isFood
    ? `${itemCount || request?.cart?.length || 0} items`
    : status.detail;
  const outcomeText =
    status.label === "Completed" && completion
      ? `Completed in ${completion}`
      : status.label === "Rejected"
        ? "View reason"
        : status.detail;

  return (
    <button
      type="button"
      onClick={() => onSelect(request)}
      className="flex w-full items-center gap-3 rounded-[18px] border border-[#E6E0D8] bg-white p-3 text-left shadow-[0_10px_24px_rgba(39,30,24,0.05)] transition duration-200 active:scale-[0.99]"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${status.card}`}>
        {requestImage ? (
          <Image
            src={requestImage}
            alt={getRequestTitle(request)}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon className="h-6 w-6 text-blue-700" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-[0.9rem]  text-slate-950">{getRequestTitle(request)}</h3>
          <StatusPill request={request} />
        </div>
        <p className="mt-1 line-clamp-1 text-[0.75rem] font-semibold text-[#52627A]">
          {isFood ? `${requestSummaryText} - ${requestedAtText}` : requestedAtText}
        </p>
        <p
          className={`mt-0.5 line-clamp-1 text-[0.72rem]  ${
            status.label === "Completed"
              ? "text-emerald-700"
              : status.label === "Rejected"
                ? "text-[#9B2D2D]"
                : "text-[#8A5A12]"
          }`}
        >
          {outcomeText}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
    </button>
  );
};

const EditableFoodOrderBar = ({
  request,
  remainingMs,
  onOpen,
}: {
  request: RoomChat;
  remainingMs: number;
  onOpen: () => void;
}) => {
  const countdown = formatCountdown(remainingMs);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="shrink-0 border-b border-blue-100 bg-white px-3 py-2.5 text-left shadow-[0_8px_22px_rgba(37,99,235,0.08)]"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          <Utensils className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[0.8rem] font-semibold text-blue-950">
            Edit Food Order #{getRequestCode(request)}
          </p>
          <p className="mt-0.5 text-[0.68rem] font-medium text-blue-700">
            {countdown.minutes}:{countdown.seconds} left to modify items
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-700 px-3 py-1.5 text-[0.68rem] font-semibold text-white">
          Edit
        </span>
      </div>
    </button>
  );
};

const RequestBottomBar = ({
  requests,
  onSelect,
}: {
  requests: RoomChat[];
  onSelect: (request: RoomChat) => void;
}) => {
  const pending = requests.filter(isPendingRequest);
  const foodOrders = requests.filter(isFoodRequest);
  const completed = requests.filter(isCompletedRequest);

  const items = [
    {
      label: "Requests",
      count: requests.length,
      icon: Package,
      target: requests[0],
      tone: "text-[#211915]",
    },
    {
      label: "Orders",
      count: foodOrders.length,
      icon: Utensils,
      target: foodOrders[0],
      tone: "text-blue-700",
    },
    {
      label: "Pending",
      count: pending.length,
      icon: Clock3,
      target: pending[0],
      tone: "text-amber-700",
    },
    {
      label: "Done",
      count: completed.length,
      icon: CheckCircle2,
      target: completed[0],
      tone: "text-emerald-700",
    },
  ];

  return (
    <nav className="shrink-0 border-t border-[#E8E2DA] bg-white/95 px-3 py-2 shadow-[0_-10px_26px_rgba(33,25,21,0.08)] backdrop-blur poppins-regular">
      <div className="grid grid-cols-4 gap-1 rounded-[18px] bg-[#F5F1EB] p-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.target && onSelect(item.target)}
              disabled={!item.target}
              className="relative flex min-h-[3.35rem] flex-col items-center justify-center rounded-2xl bg-white px-1 text-[0.64rem] font-semibold text-[#61564F] shadow-sm transition active:scale-[0.98] disabled:opacity-45"
            >
              <span className={`relative ${item.tone}`}>
                <Icon className="h-4 w-4" />
                {item.count > 0 ? (
                  <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-[#211915] px-1 text-center text-[0.55rem] leading-4 text-white">
                    {item.count}
                  </span>
                ) : null}
              </span>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const MyRequests = ({ requests, onSelect }: { requests: RoomChat[]; onSelect: (request: RoomChat) => void }) => {
  const [filter, setFilter] = useState<RequestFilter>("all");
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filter === "pending") return isPendingRequest(request);
      if (filter === "completed") return isCompletedRequest(request);
      if (filter === "rejected") return isRejectedRequest(request);
      return true;
    });
  }, [filter, requests]);

  const filters: Array<{ id: RequestFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <main className="flex-1 overflow-y-auto mx-2 px-2 pb-6 pt-5 poppins-regular">
      <h2 className="text-[0.95rem]  text-[#211915]">My Requests</h2>
      <div className="mt-3 flex gap-1.5 overflow-x-auto rounded-[16px] border border-[#E7DFD6] bg-[#F1ECE5] p-1 hide-scrollbar">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-[0.75rem]  transition duration-200 ${
              filter === item.id
                ? "bg-[#211915] text-white shadow-[0_8px_18px_rgba(33,25,21,0.16)]"
                : "text-[#6F625B] hover:bg-white/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-3">
        {filteredRequests.map((request) => (
          <RequestListItem key={request._id} request={request} onSelect={onSelect} />
        ))}
      </section>

      {filteredRequests.length === 0 && (
        <div className="mt-12 rounded-[18px] border border-[#E6E0D8] bg-white p-6 text-center shadow-[0_10px_24px_rgba(39,30,24,0.04)]">
          <Bell className="mx-auto h-8 w-8 text-[#8A5A12]" />
          <p className="mt-3 text-sm font-semibold text-[#4A403A]">No requests in this view.</p>
        </div>
      )}

      <section className="mt-7 rounded-[18px] border border-[#E6E0D8] bg-[#F5F1EB] p-4">
        <div className="flex gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#7B2C4C]" />
          <div>
            <h3 className="text-[0.86rem]  text-[#211915]">We'll keep you updated</h3>
            <p className="mt-1 text-[0.76rem] font-medium leading-relaxed text-[#6F625B]">
              You'll get real-time updates at every step.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

const ProgressRing = ({
  percent,
  overdue = false,
}: {
  percent: number;
  overdue?: boolean;
}) => (
  <div
    className="relative flex h-[6.1rem] w-[6.1rem] shrink-0 items-center justify-center rounded-full"
    style={{
      background: overdue
        ? "conic-gradient(#DC2626 100%, #FECACA 100%)"
        : `conic-gradient(#6D4DEB ${percent}%, #E5DDFC ${percent}% 100%)`,
    }}
  >
    <div className="flex h-[4.65rem] w-[4.65rem] flex-col items-center justify-center rounded-full bg-white shadow-inner">
      <span className={`text-[1.05rem]  leading-none ${overdue ? "text-[#B42318]" : "text-[#19152E]"}`}>
        {Math.round(percent)}%
      </span>
      <span className={`mt-1 text-[0.58rem]  ${overdue ? "text-[#B42318]" : "text-[#554B78]"}`}>
        {overdue ? "delayed" : "remaining"}
      </span>
    </div>
  </div>
);

const RequestTimer = ({
  request,
  withRing = false,
  message,
}: {
  request: RoomChat;
  withRing?: boolean;
  message?: string;
}) => {
  const active = !isCompletedRequest(request) && !isRejectedRequest(request);
  const now = useNow(active);
  const eta = getEta(request, now);
  const estimatedMinutes = getEstimatedMinutes(request);
  const isOverdue = eta.overdueMs > 0;
  const timerClock = formatCountdown(isOverdue ? eta.overdueMs : eta.remainingMs);
  const remainingPercent = isOverdue
    ? 100
    : Math.max(0, Math.min(100, 100 - eta.elapsedPercent));
  const progressPercent = isOverdue ? 100 : eta.elapsedPercent;

  if (!active) return null;

  return (
    <section
      className={`rounded-2xl border p-4 shadow-[0_10px_24px_rgba(87,64,204,0.06)] ${
        isOverdue
          ? "border-[#F3B4B4] bg-[#FFF6F6]"
          : "border-[#DDD3FF] bg-[#FCFAFF]"
      }`}
    >
      <div className={withRing ? "flex items-center gap-4" : ""}>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <p className={`text-[0.7rem]  ${isOverdue ? "text-[#B42318]" : "text-[#716994]"}`}>
                Estimated time
              </p>
              <p className={`mt-1 text-[0.78rem]  ${isOverdue ? "text-[#7A271A]" : "text-[#19152E]"}`}>
                {estimatedMinutes || 1} min
              </p>
            </div>
            <div className={`border-l pl-4 text-right ${isOverdue ? "border-[#F3B4B4]" : "border-[#E7E0FF]"}`}>
              <p className={`text-[0.68rem]  ${isOverdue ? "text-[#B42318]" : "text-[#716994]"}`}>
                Expected by
              </p>
              <p className={`mt-2 text-[0.82rem]  ${isOverdue ? "text-[#7A271A]" : "text-[#19152E]"}`}>
                {formatHotelTime(eta.expectedAt)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-[0.7rem]  ${isOverdue ? "text-[#B42318]" : "text-[#716994]"}`}>
              {isOverdue ? "Delayed by" : "Time remaining"}
            </p>
            <div className={`mt-1 flex items-end gap-2  tabular-nums ${isOverdue ? "text-[#B42318]" : "text-[#070A25]"}`}>
              {isOverdue ? (
                <span className="text-[1.8rem] leading-none">+</span>
              ) : null}
              <span className="text-[1.8rem] leading-none">
                {timerClock.minutes}
              </span>
              <span className="pb-1 text-base">:</span>
              <span className="text-[1.8rem] leading-none">
                {timerClock.seconds}
              </span>
            </div>
            <div className={`mt-0.5 flex gap-5 text-[0.6rem]  ${isOverdue ? "text-[#B42318]" : "text-[#716994]"}`}>
              <span>min</span>
              <span>sec</span>
            </div>
          </div>
          <div className={`mt-4 h-1.5 overflow-hidden rounded-full ${isOverdue ? "bg-[#FECACA]" : "bg-[#E5DDFC]"}`}>
            <motion.div
              className={`h-full rounded-full ${isOverdue ? "bg-[#DC2626]" : "bg-[#6D4DEB]"}`}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className={`mt-3 text-[0.76rem] font-semibold w-full ${isOverdue ? "text-[#B42318]" : "text-[#655D83]"}`}>
            {isOverdue
              ? "We are sorry, this is taking longer than expected. Thank you for your patience."
              : message || "We're preparing your request."}
          </p>
        </div>
        {withRing ? (
          <ProgressRing percent={remainingPercent} overdue={isOverdue} />
        ) : null}
      </div>
    </section>
  );
};

const FoodOrderItem = ({
  item,
  status,
  editing = false,
  onIncrement,
  onDecrement,
  onRemove,
  disableRemove = false,
}: {
  item: Cart;
  status: string;
  editing?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  disableRemove?: boolean;
}) => (
  <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0">
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
      {item?.dish?.images?.[0] ? (
        <Image
          src={item.dish.images[0]}
          alt={item?.dish?.name || "Food item"}
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Utensils className="h-5 w-5 text-slate-400" />
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-2">
        <span className="text-[0.82rem]  text-slate-500">{item?.quantity || 1}</span>
        <h4 className="line-clamp-2 text-[0.84rem]  text-slate-950">{item?.dish?.name || "Item"}</h4>
      </div>
      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrement}
            disabled={(item?.quantity || 1) <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-5 text-center text-[0.8rem] font-semibold text-slate-900">
            {item?.quantity || 1}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disableRemove}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
    <div className="text-right">
      <p className={`text-[0.82rem]  text-slate-950 ${status === "Unavailable" ? "line-through text-slate-400" : ""}`}>
        Rs. {getCartItemTotal(item)}
      </p>
      <p
        className={`mt-1 text-[0.68rem]  ${
          status === "Delivered"
            ? "text-emerald-700"
            : status === "Unavailable"
              ? "text-[#9B2D2D]"
              : "text-blue-700"
        }`}
      >
        {status}
      </p>
    </div>
  </div>
);

const FoodOrderDetails = ({
  request,
  cart: editableCart,
  editing = false,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  request: RoomChat;
  cart?: Cart[];
  editing?: boolean;
  onIncrement?: (itemId: string) => void;
  onDecrement?: (itemId: string) => void;
  onRemove?: (itemId: string) => void;
}) => {
  const cart = (editableCart ?? request?.cart ?? []) as Cart[];
  if (!cart.length) return null;
  const subtotal = cart.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const itemStatus =
    request?.alertId?.alertProgress === "DELIVERED"
      ? "Delivered"
      : isRejectedRequest(request)
        ? "Unavailable"
        : "Preparing";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-[0.9rem]  text-slate-950">
          Order Items ({getTotalItems(request)})
        </h3>
      </div>
      <div className="px-4">
        {cart.map((item) => (
          <FoodOrderItem
            key={item?.id || item?.dish?._id}
            item={item}
            status={itemStatus}
            editing={editing}
            onIncrement={() => onIncrement?.(item.id)}
            onDecrement={() => onDecrement?.(item.id)}
            onRemove={() => onRemove?.(item.id)}
            disableRemove={cart.length <= 1}
          />
        ))}
      </div>
      <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-[0.82rem]">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-[0.95rem]  text-slate-950">
          <span>Total</span>
          <span>Rs. {subtotal}</span>
        </div>
      </div>
    </section>
  );
};

const FoodOrderCard = ({
  request,
  contactPhone,
  editWindowMinutes,
  onSaveEdit,
}: {
  request: RoomChat;
  contactPhone?: string;
  editWindowMinutes: number;
  onSaveEdit: (alertId: string, cart: Cart[]) => Promise<void>;
}) => {
  const active = !isCompletedRequest(request) && !isRejectedRequest(request);
  const now = useNow(active);
  const editState = getOrderEditState(request, editWindowMinutes, now);
  const [isEditing, setIsEditing] = useState(false);
  const [draftCart, setDraftCart] = useState<Cart[]>((request?.cart ?? []) as Cart[]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftCart((request?.cart ?? []) as Cart[]);
    setIsEditing(false);
  }, [request?._id]);

  useEffect(() => {
    if (!editState.editable && isEditing) setIsEditing(false);
  }, [editState.editable, isEditing]);

  const updateDraftQuantity = (itemId: string, delta: number) => {
    setDraftCart((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      )
    );
  };

  const removeDraftItem = (itemId: string) => {
    setDraftCart((items) => (items.length <= 1 ? items : items.filter((item) => item.id !== itemId)));
  };

  const handleSave = async () => {
    const alertId = request?.alertId?._id;
    if (!alertId) return;
    if (!draftCart.length) {
      toast.error("At least one item is required to update the order.");
      return;
    }

    try {
      setIsSaving(true);
      await onSaveEdit(alertId, draftCart);
      toast.success("Order updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[18px] border border-[#E0E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(31,41,80,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1rem]  text-[#10142A]">
            Food Order #{getRequestCode(request)}
          </h2>
          <p className="mt-1 text-[0.72rem] font-semibold text-[#52627A]">
            Ordered at {formatHotelTime(request?.date)}
          </p>
        </div>
        <StatusPill request={request} />
      </div>

      {editWindowMinutes > 0 && active ? (
        <div className={`mt-4 rounded-2xl border p-3 ${
          editState.editable
            ? "border-blue-100 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-[0.78rem] font-semibold ${
                editState.editable ? "text-blue-800" : "text-slate-500"
              }`}>
                {editState.editable ? "Order editable now" : "Edit time closed"}
              </p>
              <p className="mt-1 text-[0.72rem] font-medium text-slate-600">
                {editState.editable
                  ? `${formatDuration(editState.remainingMs)} left to modify this order.`
                  : `Editing was available for ${editWindowMinutes} min after ordering.`}
              </p>
            </div>
            {editState.editable ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsEditing((value) => !value)}
                className="rounded-full border-blue-200 bg-white text-blue-700"
              >
                {isEditing ? "Close edit" : "Edit order"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isCompletedRequest(request) && !isRejectedRequest(request) ? (
        <div className="mt-4">
          <RequestTimer
            request={request}
            message="Your order is being prepared."
          />
        </div>
      ) : null}

      {isRejectedRequest(request) ? (
        <div className="mt-4">
          <RejectedRequest request={request} contactPhone={contactPhone} />
        </div>
      ) : null}

      {isCompletedRequest(request) ? (
        <div className="mt-4">
          <DeliveredRequest request={request} />
        </div>
      ) : null}

      <div className="mt-4">
        <FoodOrderDetails
          request={request}
          cart={isEditing ? draftCart : undefined}
          editing={isEditing}
          onIncrement={(itemId) => updateDraftQuantity(itemId, 1)}
          onDecrement={(itemId) => updateDraftQuantity(itemId, -1)}
          onRemove={removeDraftItem}
        />
      </div>

      {isEditing ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraftCart((request?.cart ?? []) as Cart[]);
              setIsEditing(false);
            }}
            disabled={isSaving}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !draftCart.length}
            className="rounded-xl bg-[#111111] text-white hover:bg-[#111111]/90"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      ) : null}
    </section>
  );
};

const CartUpdate = ({ reply }: { reply: RoomChatReply }) => {
  if (!reply?.description?.startsWith(ORDER_UPDATE_PREFIX)) return null;
  const removed = reply.description.match(/Removed:\s?(.*?)\.\s?Updated cart items:/i)?.[1];

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h3 className="text-[0.86rem]  text-slate-950">Order updated</h3>
          <p className="mt-1 text-[0.76rem] font-semibold leading-relaxed text-slate-700">
            {removed || reply.description.replace(ORDER_UPDATE_PREFIX, "").trim()}
          </p>
        </div>
      </div>
    </section>
  );
};

const RejectedRequest = ({
  request,
  contactPhone,
}: {
  request: RoomChat;
  contactPhone?: string;
}) => {
  const latestWarning = [...(request?.roomChatReplyIds ?? [])].reverse().find((reply) => reply?.status === "WARNING");
  const message = request?.alertId?.message || latestWarning?.description || "We're unable to process your request right now.";
  const reasonText = getRejectionReasonText(message);
  const isFood = isFoodRequest(request);
  const handleCall = () => {
    if (contactPhone) window.location.href = `tel:${contactPhone}`;
  };

  return (
    <section className="rounded-[18px] border border-[#F0D4D4] bg-[#FFF6F6] p-4">
      <div className="flex gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#9B2D2D]" />
        <div>
          <h3 className="text-[0.92rem]  text-[#7C2727]">{isFood ? "Order rejected" : "Request unavailable"}</h3>
          <p className="mt-2 text-[0.78rem] font-semibold leading-relaxed text-[#7C2727]">
            <span className="">Reason:- </span>
            {reasonText}
          </p>
          <p className="mt-2 text-[0.76rem] font-medium text-[#9B2D2D]">
            We are sorry this could not be completed. Our front desk can help with the next best option.
          </p>
          {contactPhone ? (
            <button
              type="button"
              onClick={handleCall}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5B8B8] bg-white px-3.5 py-2 text-[0.78rem]  text-[#8F2525] shadow-sm active:scale-[0.98]"
            >
              <Phone className="h-3.5 w-3.5" />
              Call front desk
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

const DeliveredRequest = ({ request }: { request: RoomChat }) => {
  const completion = getCompletionDuration(request);
  const isFood = isFoodRequest(request);
  const performance = getDeliveryPerformance(request);
  const isLate = performance?.early === false;
  return (
    <section
      className={`rounded-2xl border p-5 text-center ${
        isLate ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <CheckCircle2 className={`mx-auto h-10 w-10 ${isLate ? "text-amber-700" : "text-emerald-700"}`} />
      <h3 className={`mt-3 text-[1rem]  ${isLate ? "text-amber-800" : "text-emerald-800"}`}>
        {isFood ? "Order Delivered" : "Delivered"}
      </h3>
      <p className="mt-1 text-[0.82rem] font-semibold text-slate-800">
        {isLate
          ? "Thank you for your patience. We are sorry this took longer than expected."
          : isFood
            ? "Your order arrived ahead of schedule. Happy to serve you."
            : `Your ${getRequestTitle(request)} was completed ahead of schedule.`}
      </p>
      {completion && (
        <p className={`mt-1 text-[0.76rem] font-medium ${isLate ? "text-amber-700" : "text-emerald-700"}`}>
          Completed in {completion}
        </p>
      )}
    </section>
  );
};

const FeedbackCard = ({
  request,
  submitted,
  onReviewSubmit,
}: {
  request: RoomChat;
  submitted: boolean;
  onReviewSubmit: (chatReplyId: string, rating: number) => Promise<void>;
}) => {
  const replyId = getReviewReplyId(request);
  if (
    request?.alertId?.alertProgress !== "DELIVERED" ||
    !replyId ||
    submitted ||
    hasSubmittedReview(request)
  )
    return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-[0.9rem]  text-slate-950">
        {isFoodRequest(request) ? "How was your order?" : "How was the service?"}
      </h3>
      <p className="mt-1 text-[0.72rem] font-medium text-slate-500">Please rate your experience</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {FEEDBACK_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onReviewSubmit(replyId, option.value)}
            className="flex min-h-20 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-3 transition active:scale-[0.98]"
          >
            <span className="text-[1.8rem] leading-none">{option.text}</span>
            <span className="mt-2 text-[0.76rem]  text-slate-800">{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

const getAcceptanceReply = (request: RoomChat) =>
  (request?.roomChatReplyIds ?? []).find((reply) =>
    /accepted|processing|ready by|completion time/i.test(reply?.description ?? "")
  );

const TimelineDot = ({
  active,
  done,
  children,
}: {
  active?: boolean;
  done?: boolean;
  children: ReactNode;
}) => (
  <div
    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
      done || active ? "bg-[#6D4DEB]" : "bg-[#A8AFBE]"
    }`}
  >
    {children}
  </div>
);

const ServiceJourney = ({
  request,
  contactPhone,
}: {
  request: RoomChat;
  contactPhone?: string;
}) => {
  const progress = request?.alertId?.alertProgress ?? "";
  const isAccepted = Boolean(request?.alertId?.acceptedAt) || [
    "ACCEPTED",
    "IS_ACCEPTED_AND_WARNING",
    "IS_ACCEPTED_AND_ESCALATION",
    "DELIVERED",
  ].includes(progress);
  const isDelivered = isCompletedRequest(request);
  const acceptanceReply = getAcceptanceReply(request);
  const serviceName = getRequestTitle(request);
  const deliveredAt = request?.alertId?.deliveredAt || getLatestReply(request)?.date;

  return (
    <section className="rounded-[18px] border border-[#E4E0F4] bg-white shadow-[0_10px_28px_rgba(31,41,80,0.06)]">
      <div className="flex items-start justify-between gap-3 border-b border-[#ECE8F6] px-4 py-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="line-clamp-1 text-[1.05rem]  text-[#10142A]">
              {serviceName}
            </h2>
          </div>
          <p className="mt-1 text-[0.75rem] font-semibold text-[#52627A]">
            Requested at {formatHotelTime(request?.date)}
          </p>
        </div>
        <StatusPill request={request} />
      </div>

      <div className="relative px-4 py-4">
        <div className="absolute bottom-9 left-8 top-7 w-px bg-[#D8CCFF]" />

        <div className="relative flex gap-2 pb-5">
          <TimelineDot done>
            <Bell className="h-4 w-4" />
          </TimelineDot>
          <div className="min-w-0 flex-1 border-b border-[#ECE8F6] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[0.86rem]  text-[#5D3FD7]">
                  Request Raised
                </h3>
                <p className="mt-1 text-[0.78rem] font-semibold leading-relaxed text-[#3F4561]">
                  You requested {serviceName.toLowerCase()}.
                </p>
              </div>
              <span className="shrink-0 text-[0.72rem] font-semibold text-[#52627A]">
                {formatHotelTime(request?.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex gap-2 pb-5">
          <TimelineDot done={isAccepted} active={!isAccepted}>
            <CheckCircle2 className="h-4 w-4" />
          </TimelineDot>
          <div className="min-w-0 flex-1 border-b border-[#ECE8F6] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-[0.86rem]  ${isAccepted ? "text-[#5D3FD7]" : "text-[#6B7280]"}`}>
                  {isAccepted ? "Request Accepted" : "Waiting for acceptance"}
                </h3>
                <p className="mt-1 text-[0.78rem] font-semibold leading-relaxed text-[#3F4561]">
                  {isAccepted
                    ? `${acceptanceReply?.userId?.name || "Hotel team"} has accepted your request.`
                    : "The hotel team will accept this shortly."}
                </p>
              </div>
              {request?.alertId?.acceptedAt ? (
                <span className="shrink-0 text-[0.72rem] font-semibold text-[#52627A]">
                  {formatHotelTime(request.alertId.acceptedAt)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {!isRejectedRequest(request) ? (
          <div className="relative flex gap-2 pb-5">
            <TimelineDot active={isAccepted && !isDelivered} done={isDelivered}>
              <Clock3 className="h-4 w-4" />
            </TimelineDot>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[0.86rem]  text-[#5D3FD7]">
                    In Progress
                  </h3>
                  <p className="mt-1 text-[0.78rem] font-semibold leading-relaxed text-[#3F4561]">
                    {isDelivered ? "Completed by the hotel team." : "We're on it."}
                  </p>
                </div>
                {isAccepted ? (
                  <span className="shrink-0 text-[0.72rem] font-semibold text-[#52627A]">
                    {formatHotelTime(request?.alertId?.acceptedAt || request?.date)}
                  </span>
                ) : null}
              </div>
              {!isDelivered ? (
                <div className="mt-4">
                  <RequestTimer
                    request={request}
                    withRing
                    message={`Almost there. your ${serviceName.toLowerCase()} request is in process.`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="relative flex gap-4">
          <TimelineDot done={isDelivered}>
            <CheckCircle2 className="h-4 w-4" />
          </TimelineDot>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-[0.86rem]  ${isDelivered ? "text-emerald-700" : "text-[#6B7280]"}`}>
                  Delivered
                </h3>
                <p className="mt-1 text-[0.78rem] font-semibold leading-relaxed text-[#3F4561]">
                  {isDelivered ? `${serviceName} has been delivered.` : "Waiting for completion"}
                </p>
              </div>
              {deliveredAt && isDelivered ? (
                <span className="shrink-0 text-[0.72rem] font-semibold text-[#52627A]">
                  {formatHotelTime(deliveredAt)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isRejectedRequest(request) ? (
        <div className="px-4 pb-4">
          <RejectedRequest request={request} contactPhone={contactPhone} />
        </div>
      ) : null}

      {isDelivered ? (
        <div className="px-4 pb-4">
          <DeliveredRequest request={request} />
        </div>
      ) : null}
    </section>
  );
};

const RequestDetail = ({
  request,
  submitted,
  onReviewSubmit,
  contactPhone,
}: {
  request: RoomChat;
  submitted: boolean;
  onReviewSubmit: (chatReplyId: string, rating: number) => Promise<void>;
  contactPhone?: string;
}) => {
  const isFood = isFoodRequest(request);
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);
  const editWindowMinutes = Number(outletInfo?.orderEditWindowMinutes ?? 2);
  const { editGuestFoodOrder } = useEditGuestFoodOrder();
  const updateReplies = (request?.roomChatReplyIds ?? []).filter((reply) =>
    reply?.description?.startsWith(ORDER_UPDATE_PREFIX)
  );
  const handleSaveFoodEdit = async (alertId: string, cart: Cart[]) => {
    if (!request?.userId?._id) {
      throw new Error("Unable to identify the guest for this order");
    }
    await editGuestFoodOrder({
      alertId,
      userId: request?.userId?._id,
      cart,
    });
  };

  return (
    <main className="flex-1 overflow-y-auto px-1 pb-6 pt-4 poppins-regular">
      <div className="space-y-4">
        {isFood ? (
          <>
            <FoodOrderCard
              request={request}
              contactPhone={contactPhone}
              editWindowMinutes={editWindowMinutes}
              onSaveEdit={handleSaveFoodEdit}
            />
            {updateReplies.map((reply) => (
              <CartUpdate key={reply._id} reply={reply} />
            ))}
          </>
        ) : (
          <ServiceJourney request={request} contactPhone={contactPhone} />
        )}
        <FeedbackCard request={request} submitted={submitted} onReviewSubmit={onReviewSubmit} />
      </div>
    </main>
  );
};

export const GuestSupportScreen = ({
  hotelName,
  logo,
  room,
  requests,
  onClose,
  onReviewSubmit,
  contactPhone,
}: GuestSupportScreenProps) => {
  const sortedRequests = useMemo(
    () => [...(requests ?? [])].sort((a, b) => (b?.date ?? 0) - (a?.date ?? 0)),
    [requests]
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, boolean>>({});
  const selectedRequest = sortedRequests.find((request) => request._id === selectedRequestId);
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);
  const editWindowMinutes = Number(outletInfo?.orderEditWindowMinutes ?? 2);
  const hasActiveOrders = sortedRequests.some((request) => isFoodRequest(request) && isPendingRequest(request));
  const now = useNow(hasActiveOrders);
  const editableOrder = useMemo(
    () =>
      sortedRequests.find(
        (request) =>
          getOrderEditState(request, editWindowMinutes, now).editable
      ),
    [editWindowMinutes, now, sortedRequests]
  );
  const editableOrderState = editableOrder
    ? getOrderEditState(editableOrder, editWindowMinutes, now)
    : null;

  const handleReview = async (replyId: string, rating: number) => {
    try {
      await onReviewSubmit(replyId, rating);
      setSubmittedRatings((prev) => ({ ...prev, [replyId]: true }));
    } catch {
      // The caller owns the user-facing failure toast.
    }
  };

  useEffect(() => {
    if (selectedRequestId && !selectedRequest) setSelectedRequestId("");
  }, [selectedRequest, selectedRequestId]);

  return (
    <div className="flex h-full flex-col bg-[#F8F7F4] text-slate-950 poppins-regular">
      <ChatHeader
        hotelName={hotelName}
        logo={logo}
        room={room}
        onClose={selectedRequest ? () => setSelectedRequestId("") : onClose}
        title={selectedRequest ? getRequestTitle(selectedRequest) : undefined}
        subtitle={selectedRequest ? getStatusMeta(selectedRequest).label : undefined}
      />
      {editableOrder && editableOrderState && selectedRequest?._id !== editableOrder._id ? (
        <EditableFoodOrderBar
          request={editableOrder}
          remainingMs={editableOrderState.remainingMs}
          onOpen={() => setSelectedRequestId(editableOrder._id)}
        />
      ) : null}
      <AnimatePresence mode="wait">
        {selectedRequest ? (
          <motion.div
            key={selectedRequest._id}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
          >
            <RequestDetail
              request={selectedRequest}
              submitted={Boolean(submittedRatings[getReviewReplyId(selectedRequest) || ""])}
              onReviewSubmit={handleReview}
              contactPhone={contactPhone}
            />
          </motion.div>
        ) : (
          <motion.div
            key="requests"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.22 }}
          >
            <MyRequests requests={sortedRequests} onSelect={(request) => setSelectedRequestId(request._id)} />
          </motion.div>
        )}
      </AnimatePresence>
      <RequestBottomBar
        requests={sortedRequests}
        onSelect={(request) => setSelectedRequestId(request._id)}
      />
    </div>
  );
};

export const ChatMessageHotel = () => null;
