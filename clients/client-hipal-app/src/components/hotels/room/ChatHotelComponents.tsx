import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ShoppingCart, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  actionOptions,
  ActionType,
  formatHotelTime,
  reviewOptions,
} from "@/components/utils/helpersHotel";
import type {
  Cart,
  ChatHeaderProps,
  ChatMessageHotelProps,
  ChatReplyMessageProps,
  RoomChatReply,
  Service,
} from "@/components/types/hotelTypes";
import MemoFoodType from "@/components/atoms/foodType";

/* ─────────────────────────── Chat Header ─────────────────────────── */

export const ChatHeader = ({
  hotelName,
  logo,
  room,
  onClose,
}: ChatHeaderProps) => (
  <section className="flex items-center gap-3 px-4 py-3.5 bg-white/95 backdrop-blur-xl text-slate-900 fixed w-full max-w-[30rem] top-0 z-20 border-b border-slate-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="h-8 w-8 rounded-full hover:bg-slate-100 transition-colors shrink-0"
    >
      <ChevronLeft className="h-4 w-4 text-slate-600" />
    </Button>
    <article className="flex items-center gap-3 flex-1 min-w-0">
      <Avatar className="h-9 w-9 border-2 border-slate-100 shadow-sm shrink-0">
        <AvatarImage src={logo} alt={hotelName} className="object-cover" />
        <AvatarFallback className="bg-gradient-to-br from-amber-50 to-orange-100 text-amber-700 font-semibold text-sm">
          {hotelName?.charAt(0) || "H"}
        </AvatarFallback>
      </Avatar>
      <aside className="flex flex-col min-w-0">
        <h1 className="font-semibold text-[13px] text-slate-900 leading-none tracking-tight line-clamp-1">
          {hotelName}
        </h1>
        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Room {room} · Active
        </p>
      </aside>
    </article>
  </section>
);

/* ─────────────────────── Status Badge (extracted, stable) ─────────────────────── */

interface StatusBadgeProps {
  isInProgress: boolean;
  isDelivered: boolean;
  isWarning: boolean;
}

const StatusBadge = ({ isInProgress, isDelivered, isWarning }: StatusBadgeProps) => {
  if (isInProgress)
    return (
      <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[9px] font-bold px-2.5 py-[3px] rounded-full uppercase tracking-widest shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
        In Progress
      </span>
    );
  if (isDelivered)
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-[3px] rounded-full uppercase tracking-widest shadow-sm">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Delivered
      </span>
    );
  if (isWarning)
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[9px] font-bold px-2.5 py-[3px] rounded-full uppercase tracking-widest shadow-sm">
        <AlertTriangle className="h-2.5 w-2.5" />
        Unable to Fulfill
      </span>
    );
  return null;
};

/* ─────────────────────── Chat Message Container ─────────────────────── */

export const ChatMessageHotel = ({
  chat,
  userResponses,
  handleActionClick,
  openReview,
  selectedReplyId,
  handleReviewSubmit,
}: ChatMessageHotelProps) => {
  const replyCount = chat?.roomChatReplyIds?.length ?? 0;

  return (
    <section className="flex flex-col gap-4 mt-20 px-4 pb-6 overflow-x-hidden">
      {/* Date pill */}
      <div className="flex justify-center mt-2">
        <span className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-semibold text-slate-400 tracking-widest uppercase border border-slate-200/60">
          {format(new Date(chat?.date), "MMMM d, yyyy")}
        </span>
      </div>

      {/* Guest request bubble (right) */}
      <motion.article
        initial={{ opacity: 0, x: 20, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex justify-end items-end gap-2.5"
      >
        <div className="flex flex-col items-end max-w-[78%]">
          <span className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-widest">
            {chat?.userId?.name || "You"}
          </span>
          <div className="relative rounded-[20px] rounded-br-[5px] px-4 py-3.5 bg-gradient-to-br from-[#4F46E5] via-[#4338CA] to-[#3730A3] text-white shadow-[0_8px_24px_rgba(79,70,229,0.30)] min-w-[180px] border border-indigo-400/20">
            <div className="flex flex-col gap-1">
              {chat.alertId.serviceIds.map((service: Service) => (
                <p key={service?._id} className="text-[14px] font-semibold leading-snug tracking-tight">
                  {service?.name}
                </p>
              ))}
            </div>
            <span className="text-[9px] text-indigo-200/80 mt-2.5 block text-right font-medium">
              {formatHotelTime(chat?.date)}
            </span>
          </div>
        </div>
        <Avatar className="h-8 w-8 mb-0.5 shrink-0 shadow border-2 border-white ring-1 ring-indigo-100">
          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-bold text-[10px] uppercase">
            {chat?.userId?.name?.charAt(0) || "G"}
          </AvatarFallback>
        </Avatar>
      </motion.article>

      {/* Cart summary */}
      {chat?.cart?.length > 0 && (
        <div className="flex justify-end w-full pr-10">
          <ChatCartComponent cart={chat.cart} />
        </div>
      )}

      {/* Staff replies */}
      <div className="flex flex-col gap-3.5">
        {chat?.roomChatReplyIds.map((reply: RoomChatReply, index: number) => (
          <ChatReplyMessage
            key={reply._id}
            chat={chat}
            reply={reply}
            isLatest={index === replyCount - 1}
            userResponses={userResponses}
            handleActionClick={handleActionClick}
            openReview={openReview}
            selectedReplyId={selectedReplyId}
            handleReviewSubmit={handleReviewSubmit}
            delay={index * 0.08}
          />
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────── Staff Reply Message ─────────────────────── */

const ChatReplyMessage = ({
  chat,
  reply,
  isLatest,
  userResponses,
  handleActionClick,
  openReview,
  selectedReplyId,
  handleReviewSubmit,
  delay = 0,
}: ChatReplyMessageProps & { delay?: number; isLatest: boolean }) => {
  const isWarning = reply?.status === ActionType.WARNING;

  // Status badges only shown on the latest reply — older ones are plain history
  const isInProgress = isLatest && chat?.alertId?.alertProgress === "ACCEPTED";
  const isDelivered  = isLatest && chat?.alertId?.alertProgress === "DELIVERED";

  /* ETA — computed only when the progress bar will actually render */
  let remainingMinutes = 0;
  let progressPercent = 0;

  if (isInProgress) {
    const acceptedAt = chat?.alertId?.acceptedAt || chat?.alertId?.createdAt || chat?.date;
    const avgMins = chat?.alertId?.serviceIds?.[0]?.avgCompletionTime || 15;
    const totalMs = avgMins * 60 * 1000;
    const expectedAt = acceptedAt + totalMs;
    const remaining = Math.max(0, expectedAt - Date.now());
    remainingMinutes = Math.ceil(remaining / 60000);
    progressPercent = Math.min(100, Math.max(0, ((totalMs - remaining) / totalMs) * 100));
  }

  /* Bubble theme */
  const bubbleTheme = isWarning
    ? "bg-[#FFF5F5] border-[#FECACA]"
    : isInProgress
    ? "bg-white border-[#BFDBFE]"
    : isDelivered
    ? "bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] border-[#BBF7D0]"
    : "bg-white border-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.32, ease: "easeOut" }}
      className="flex items-end gap-2.5"
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 mb-0.5 shrink-0 shadow border-2 border-white ring-1 ring-slate-100">
        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-[10px] uppercase">
          {reply?.userId?.name?.charAt(0) || "S"}
        </AvatarFallback>
      </Avatar>

      <section className="flex flex-col max-w-[85%]">
        {/* Sender name */}
        <span className="text-[10px] text-slate-400 mb-1.5 ml-1 font-semibold uppercase tracking-widest">
          {reply?.userId?.name || "Hotel Support"}
        </span>

        {/* Bubble */}
        <article className={`${bubbleTheme} rounded-[20px] rounded-bl-[5px] p-4 border shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative overflow-hidden`}>
          {/* Decorative shimmer */}
          <div className="pointer-events-none absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/40 to-transparent" />

          <div className="flex flex-col gap-2.5 relative z-10">
            {/* Status badge — only on latest reply */}
            {isLatest && (
              <StatusBadge
                isInProgress={isInProgress}
                isDelivered={isDelivered}
                isWarning={isWarning}
              />
            )}

            {/* Message text — purely from backend */}
            <p className={`text-[13.5px] leading-[1.6] font-normal tracking-[-0.01em] ${
              isWarning ? "text-red-700" : "text-slate-700"
            }`}>
              {reply?.description}
            </p>

            {/* ETA progress bar — only on latest in-progress reply */}
            {isInProgress && (
              <div className="mt-1 bg-slate-50 rounded-2xl p-3 border border-slate-100/80 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                    Estimated Arrival
                  </span>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                    remainingMinutes > 0
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600 animate-pulse"
                  }`}>
                    {remainingMinutes > 0 ? `~${remainingMinutes} min away` : "Arriving now ✨"}
                  </span>
                </div>
                {/* Track */}
                <div className="h-[6px] w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 relative"
                  >
                    <div className="absolute inset-y-0 right-0 w-3 bg-white/30 animate-pulse rounded-full" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (Not Delivered / Review) */}
          {reply?.action && !userResponses[reply._id] && (
            <div className="mt-4 pt-4 border-t border-slate-100/80 flex flex-col gap-2">
              <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                How did we do?
              </p>
              {actionOptions.map((option) => {
                const isNegative = option.text?.toLowerCase().includes("not");
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleActionClick(reply._id, option.text)}
                    className={`w-full flex items-center justify-between gap-3 py-3 px-4 rounded-[14px] border text-[12.5px] font-semibold transition-all duration-200 ${
                      isNegative
                        ? "border-red-100 bg-red-50/60 text-red-600 hover:bg-red-50"
                        : "border-emerald-100 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span>{option.text}</span>
                    {isNegative
                      ? <XCircle className="h-4 w-4 opacity-70" />
                      : <CheckCircle2 className="h-4 w-4 opacity-70" />
                    }
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex justify-end mt-3 opacity-50">
            <span className="text-[9px] text-slate-400 font-semibold tracking-tight">
              {formatHotelTime(reply?.date)}
            </span>
          </div>

          {/* Emoji rating panel */}
          <AnimatePresence>
            {openReview && reply?._id === selectedReplyId && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100"
              >
                <p className="text-center font-bold tracking-[0.18em]">
                  Share your experience
                </p>
                <div className="flex justify-between items-center gap-1 p-2 bg-slate-50/60 rounded-[20px] border border-slate-100/60">
                  {reviewOptions.map((option) => (
                    <motion.button
                      key={option?.id}
                      whileHover={{ scale: 1.18, y: -3 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleReviewSubmit(reply?.userId?._id, option?.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] hover:bg-white transition-all cursor-pointer flex-1 outline-none group focus:ring-2 focus:ring-indigo-100"
                      aria-label={option?.id}
                    >
                      <span className="text-[28px] md:text-[32px] leading-none drop-shadow-sm transition-all">
                        {option?.text}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight whitespace-nowrap">
                        {option?.id}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </section>
    </motion.div>
  );
};

/* ─────────────────────── Cart Component ─────────────────────── */

const ChatCartComponent = ({ cart }: { cart: Cart[] }) => {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[18px] overflow-hidden bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] w-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white px-4 py-3 flex items-center gap-2.5">
        <ShoppingCart className="h-4 w-4 text-indigo-300 shrink-0" />
        <span className="font-semibold text-[13px] tracking-tight">Order Summary</span>
      </div>

      {/* Items */}
      <div className="px-2 py-2 bg-slate-50/60 flex flex-col gap-1.5">
        {cart.map((item) => (
          <div
            key={item?.id}
            className="p-3 bg-white rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-slate-100"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-slate-800 flex items-start gap-1.5 leading-snug">
                  <span className="mt-0.5 shrink-0">
                    <MemoFoodType types={item?.dish?.dishTypes} />
                  </span>
                  <span className="line-clamp-2">{item?.dish?.name}</span>
                </div>
                {item?.portion && (
                  <span className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                    {item?.portion?.name}
                  </span>
                )}
                {item?.extras?.length > 0 && (
                  <p className="text-[10px] mt-1.5 text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-600">Add-ons: </span>
                    {item.extras.map((extra, index) => (
                      <span key={extra.id}>
                        {extra.name}
                        {extra.quantity > 1 && (
                          <span className="text-slate-400"> ×{extra.quantity}</span>
                        )}
                        {index !== item.extras.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <span className="text-[12px] font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                ₹{item?.dish?.price * item?.quantity}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">
                ₹{item?.dish?.price} × {item?.quantity}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                Qty {item?.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
        <span className="text-[15px] font-bold text-indigo-600">₹{totalPrice}</span>
      </div>
    </motion.div>
  );
};
