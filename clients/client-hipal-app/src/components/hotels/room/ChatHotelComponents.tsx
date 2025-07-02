import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingCart } from "lucide-react";
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

export const ChatHeader = ({
  hotelName,
  logo,
  room,
  onClose,
}: ChatHeaderProps) => (
  <section className="flex items-center p-4 border-b bg-white text-black fixed w-full max-w-[30rem] top-0 z-10 shadow-sm">
    <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
      <ChevronLeft className="h-5 w-5" />
    </Button>
    <article className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={logo} alt={hotelName} />
        <AvatarFallback>{hotelName?.charAt(0) || "🏩"}</AvatarFallback>
      </Avatar>
      <aside>
        <h1 className="font-medium">{hotelName}</h1>
        <p className="text-xs text-gray-500">Room {room}</p>
      </aside>
    </article>
  </section>
);

export const ChatMessageHotel = ({
  chat,
  userResponses,
  handleActionClick,
  openReview,
  selectedReplyId,
  handleReviewSubmit,
}: ChatMessageHotelProps) => (
  <section className="space-y-4 mt-20">
    <article className="flex flex-col items-center justify-center my-4">
      <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-xs text-gray-500 mb-2">
        {format(new Date(chat?.date), "MMMM d, yyyy")}
      </div>
    </article>
    <article className="flex justify-end mb-2">
      <Avatar className="h-8 w-8 mr-2 mt-1">
        <AvatarFallback className="bg-gray-200 text-gray-600">
          {chat?.userId?.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[75%]">
        <span className="text-xs text-gray-500 mb-1 ml-1">
          {chat?.userId?.name}
        </span>
        <div className="rounded-2xl px-3 pt-3 pb-1 bg-blue-600 text-white rounded-br-none">
          {chat.alertId.serviceIds.map((service: Service) => (
            <p key={service?._id} className="text-sm">
              {service?.name}
            </p>
          ))}
          <span className="text-[0.65rem] text-gray-300 mt-1 float-right">
            {formatHotelTime(chat?.date)}
          </span>
        </div>
      </div>
    </article>
    <article className="space-y-4">
      {chat?.cart?.length > 0 ? (
        <article>
          <ChatCartComponent cart={chat?.cart} />
        </article>
      ) : null}
      {chat?.roomChatReplyIds.map((reply: RoomChatReply) => (
        <ChatReplyMessage
          key={reply._id}
          reply={reply}
          userResponses={userResponses}
          handleActionClick={handleActionClick}
          openReview={openReview}
          selectedReplyId={selectedReplyId}
          handleReviewSubmit={handleReviewSubmit}
        />
      ))}
    </article>
  </section>
);

const ChatReplyMessage = ({
  reply,
  userResponses,
  handleActionClick,
  openReview,
  selectedReplyId,
  handleReviewSubmit,
}: ChatReplyMessageProps) => (
  <section className="flex justify-start">
    <Avatar className="h-8 w-8 mr-2 mt-1">
      <AvatarFallback className="bg-gray-200 text-gray-600">
        {reply?.userId?.name?.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <section className="flex flex-col max-w-[75%]">
      <article
        className={`${
          reply?.status === ActionType.WARNING ? "bg-red-100" : "bg-white"
        } rounded-2xl rounded-bl-none px-3 pt-3 pb-1 shadow-sm`}
      >
        <p className="text-sm">{reply?.description}</p>
        {reply?.action && !userResponses[reply._id] && (
          <article
            className={`${
              reply?.status === ActionType.WARNING ? "bg-red-100" : "bg-white"
            } p-3 rounded-2xl rounded-bl-none flex flex-col gap-2 w-full`}
          >
            <p className="text-sm text-gray-600 ml-1 mb-1">
              Please choose an option:
            </p>
            {actionOptions.map((option) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-sm w-full text-left p-3 rounded-lg border shadow-sm transition-colors ${
                  userResponses[reply._id] === option.text
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-50 border-gray-200 text-indigo-600 hover:bg-gray-100"
                }`}
                onClick={() => handleActionClick(reply._id, option.text)}
              >
                {option.text}
              </motion.button>
            ))}
          </article>
        )}
        <span className="text-[0.65rem] text-gray-400 mt-1 float-right">
          {formatHotelTime(reply?.date)}
        </span>
        {openReview && reply?._id === selectedReplyId && (
          <article className="flex justify-around mt-2">
            {reviewOptions?.map((option) => (
              <span
                onKeyDown={() =>
                  handleReviewSubmit(reply?.userId?._id, option?.value)
                }
                key={option?.id}
                onClick={() =>
                  handleReviewSubmit(reply.userId._id, option?.value)
                }
                role="img"
                aria-label={option?.id}
                className="hover:scale-110 text-3xl cursor-pointer"
              >
                {option?.text}
              </span>
            ))}
          </article>
        )}
      </article>
    </section>
  </section>
);

const ChatCartComponent = ({ cart }: { cart: Cart[] }) => {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        <span className="font-medium">Order Details</span>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-2">
        {cart?.map((item) => (
          <div
            key={item?.id}
            className="py-2 border-b last:border-b-0 border-gray-100"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {item?.dish?.name}
                  <MemoFoodType types={item?.dish?.dishTypes} />
                </div>
                {item?.portion && (
                  <div className={"text-xs text-gray-500"}>
                    Portion: {item?.portion?.name}
                  </div>
                )}
                {item?.extras && item?.extras.length > 0 && (
                  <div className="text-xs mt-1 text-gray-500">
                    Extras:{" "}
                    {item.extras.map((extra, index) => (
                      <span key={extra.id}>
                        {extra.name}{" "}
                        {extra.quantity > 1 ? `× ${extra.quantity}` : ""}
                        {index !== item.extras.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={"text-right text-gray-900"}>
                ₹{item?.dish?.price * item?.quantity}
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center">
                <span className={"text-xs text-gray-500"}>
                  ₹{item?.dish?.price} × {item?.quantity}
                </span>
              </div>
              <span className="text-sm font-medium">Qty: {item?.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Total */}
      <div className={"px-4 py-3 bg-blue-500 text-white"}>
        <div className="flex justify-between items-center">
          <span className="font-medium">Total</span>
          <span>₹{totalPrice}</span>
        </div>
      </div>
    </motion.div>
  );
};
