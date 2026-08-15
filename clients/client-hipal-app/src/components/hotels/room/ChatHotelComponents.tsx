import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Package,
  Phone,
  Utensils,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

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
  const remainingMs = Math.max(0, expectedAt - now);
  const elapsedPercent = Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100));

  return {
    expectedAt,
    remainingMs,
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
        <AvatarFallback className="bg-slate-100 text-sm font-bold text-slate-700">
          {hotelName?.charAt(0) || "H"}
        </AvatarFallback>
      </Avatar>
      <aside className="min-w-0">
        <h1 className="line-clamp-1 text-[0.98rem] font-bold leading-tight">{title || hotelName || "Guest support"}</h1>
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
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.68rem] font-bold ring-1 ${status.pill}`}>
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
          <h3 className="line-clamp-1 text-[0.9rem] font-bold text-slate-950">{getRequestTitle(request)}</h3>
          <StatusPill request={request} />
        </div>
        <p className="mt-1 line-clamp-1 text-[0.75rem] font-semibold text-[#52627A]">
          {isFood ? `${requestSummaryText} - ${requestedAtText}` : requestedAtText}
        </p>
        <p
          className={`mt-0.5 line-clamp-1 text-[0.72rem] font-bold ${
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
      <h2 className="text-[0.95rem] font-bold text-[#211915]">My Requests</h2>
      <div className="mt-3 flex gap-1.5 overflow-x-auto rounded-[16px] border border-[#E7DFD6] bg-[#F1ECE5] p-1 hide-scrollbar">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-[0.75rem] font-bold transition duration-200 ${
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
            <h3 className="text-[0.86rem] font-bold text-[#211915]">We'll keep you updated</h3>
            <p className="mt-1 text-[0.76rem] font-medium leading-relaxed text-[#6F625B]">
              You'll get real-time updates at every step.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

const ProgressRing = ({ percent }: { percent: number }) => (
  <div
    className="relative flex h-[6.1rem] w-[6.1rem] shrink-0 items-center justify-center rounded-full"
    style={{
      background: `conic-gradient(#6D4DEB ${percent}%, #E5DDFC ${percent}% 100%)`,
    }}
  >
    <div className="flex h-[4.65rem] w-[4.65rem] flex-col items-center justify-center rounded-full bg-white shadow-inner">
      <span className="text-[1.05rem] font-extrabold leading-none text-[#19152E]">
        {Math.round(percent)}%
      </span>
      <span className="mt-1 text-[0.58rem] font-bold text-[#554B78]">
        remaining
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
  const remainingPercent = Math.max(0, Math.min(100, 100 - eta.elapsedPercent));

  if (!active) return null;

  return (
    <section className="rounded-2xl border border-[#DDD3FF] bg-[#FCFAFF] p-4 shadow-[0_10px_24px_rgba(87,64,204,0.06)]">
      <div className={withRing ? "flex items-center gap-4" : ""}>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <p className="text-[0.7rem] font-bold text-[#716994]">
                Estimated time
              </p>
              <p className="mt-1 text-[0.78rem] font-extrabold text-[#19152E]">
                {estimatedMinutes || 1} min
              </p>
            </div>
            <div className="border-l border-[#E7E0FF] pl-4 text-right">
              <p className="text-[0.68rem] font-bold text-[#716994]">
                Expected by
              </p>
              <p className="mt-2 text-[0.82rem] font-extrabold text-[#19152E]">
                {formatHotelTime(eta.expectedAt)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[0.7rem] font-bold text-[#716994]">
              Time remaining
            </p>
            <div className="mt-1 flex items-end gap-2 font-extrabold tabular-nums text-[#070A25]">
              <span className="text-[1.8rem] leading-none">
                {eta.clock.minutes}
              </span>
              <span className="pb-1 text-base">:</span>
              <span className="text-[1.8rem] leading-none">
                {eta.clock.seconds}
              </span>
            </div>
            <div className="mt-0.5 flex gap-5 text-[0.6rem] font-bold text-[#716994]">
              <span>min</span>
              <span>sec</span>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E5DDFC]">
            <motion.div
              className="h-full rounded-full bg-[#6D4DEB]"
              animate={{ width: `${eta.elapsedPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="mt-3 text-[0.76rem] font-semibold text-[#655D83]">
            {message || "We're preparing your request."}
          </p>
        </div>
        {withRing ? <ProgressRing percent={remainingPercent} /> : null}
      </div>
    </section>
  );
};

const FoodOrderItem = ({ item, status }: { item: Cart; status: string }) => (
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
        <span className="text-[0.82rem] font-bold text-slate-500">{item?.quantity || 1}</span>
        <h4 className="line-clamp-2 text-[0.84rem] font-bold text-slate-950">{item?.dish?.name || "Item"}</h4>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-[0.82rem] font-bold text-slate-950 ${status === "Unavailable" ? "line-through text-slate-400" : ""}`}>
        Rs. {getCartItemTotal(item)}
      </p>
      <p
        className={`mt-1 text-[0.68rem] font-bold ${
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

const FoodOrderDetails = ({ request }: { request: RoomChat }) => {
  const cart = (request?.cart ?? []) as Cart[];
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
        <h3 className="text-[0.9rem] font-bold text-slate-950">
          Order Items ({getTotalItems(request)})
        </h3>
      </div>
      <div className="px-4">
        {cart.map((item) => (
          <FoodOrderItem key={item?.id || item?.dish?._id} item={item} status={itemStatus} />
        ))}
      </div>
      <div className="space-y-2 border-t border-slate-100 px-4 py-3 text-[0.82rem]">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex justify-between text-[0.95rem] font-bold text-slate-950">
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
}: {
  request: RoomChat;
  contactPhone?: string;
}) => {
  return (
    <section className="rounded-[18px] border border-[#E0E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(31,41,80,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1rem] font-extrabold text-[#10142A]">
            Food Order #{getRequestCode(request)}
          </h2>
          <p className="mt-1 text-[0.72rem] font-semibold text-[#52627A]">
            Ordered at {formatHotelTime(request?.date)}
          </p>
        </div>
        <StatusPill request={request} />
      </div>

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
        <FoodOrderDetails request={request} />
      </div>
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
          <h3 className="text-[0.86rem] font-bold text-slate-950">Order updated</h3>
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
          <h3 className="text-[0.92rem] font-bold text-[#7C2727]">{isFood ? "Order rejected" : "Request unavailable"}</h3>
          <p className="mt-2 text-[0.78rem] font-semibold leading-relaxed text-[#7C2727]">
            <span className="font-extrabold">Reason:- </span>
            {reasonText}
          </p>
          <p className="mt-2 text-[0.76rem] font-medium text-[#9B2D2D]">
            We are sorry this could not be completed. Our front desk can help with the next best option.
          </p>
          {contactPhone ? (
            <button
              type="button"
              onClick={handleCall}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5B8B8] bg-white px-3.5 py-2 text-[0.78rem] font-extrabold text-[#8F2525] shadow-sm active:scale-[0.98]"
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
      <h3 className={`mt-3 text-[1rem] font-bold ${isLate ? "text-amber-800" : "text-emerald-800"}`}>
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
      <h3 className="text-[0.9rem] font-bold text-slate-950">
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
            <span className="mt-2 text-[0.76rem] font-bold text-slate-800">{option.label}</span>
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
            <h2 className="line-clamp-1 text-[1.05rem] font-extrabold text-[#10142A]">
              {serviceName}
            </h2>
            <span className="rounded-full bg-[#EFE9FF] px-2.5 py-1 text-[0.65rem] font-extrabold text-[#5D3FD7]">
              Request #{getRequestCode(request)}
            </span>
          </div>
          <p className="mt-1 text-[0.75rem] font-semibold text-[#52627A]">
            Requested at {formatHotelTime(request?.date)}
          </p>
        </div>
        <StatusPill request={request} />
      </div>

      <div className="relative px-4 py-4">
        <div className="absolute bottom-9 left-8 top-7 w-px bg-[#D8CCFF]" />

        <div className="relative flex gap-4 pb-5">
          <TimelineDot done>
            <Bell className="h-4 w-4" />
          </TimelineDot>
          <div className="min-w-0 flex-1 border-b border-[#ECE8F6] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[0.86rem] font-extrabold text-[#5D3FD7]">
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

        <div className="relative flex gap-4 pb-5">
          <TimelineDot done={isAccepted} active={!isAccepted}>
            <CheckCircle2 className="h-4 w-4" />
          </TimelineDot>
          <div className="min-w-0 flex-1 border-b border-[#ECE8F6] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`text-[0.86rem] font-extrabold ${isAccepted ? "text-[#5D3FD7]" : "text-[#6B7280]"}`}>
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
          <div className="relative flex gap-4 pb-5">
            <TimelineDot active={isAccepted && !isDelivered} done={isDelivered}>
              <Clock3 className="h-4 w-4" />
            </TimelineDot>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[0.86rem] font-extrabold text-[#5D3FD7]">
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
                    message={`Almost there. We're preparing your ${serviceName.toLowerCase()}.`}
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
                <h3 className={`text-[0.86rem] font-extrabold ${isDelivered ? "text-emerald-700" : "text-[#6B7280]"}`}>
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
  const updateReplies = (request?.roomChatReplyIds ?? []).filter((reply) =>
    reply?.description?.startsWith(ORDER_UPDATE_PREFIX)
  );

  return (
    <main className="flex-1 overflow-y-auto px-3 pb-6 pt-4 poppins-regular">
      <div className="space-y-4">
        {isFood ? (
          <>
            <FoodOrderCard request={request} contactPhone={contactPhone} />
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
    </div>
  );
};

export const ChatMessageHotel = () => null;
