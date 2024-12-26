"use client";
import { lazy, memo } from "react";
import { BiSend } from "react-icons/bi";
import whatzAppDoodle from "@/assets/whatzapp/whatsappdoodle.jpg";
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import {
  useFetchAllUsers,
  useFetchUserChats,
  useSendWhatsappMessage,
} from "@/hooks/useTemplates";
import toast from "react-hot-toast";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";

const ChatsList = lazy(() => import("./chatsList"));
const ChatHistory = lazy(() => import("./chatHistory"));

const MemoWhatsappChats = () => {
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { message, setMessage, selectedUser, isMobileListView } =
    useWhatsappTempStore((s) => ({
      message: s.message,
      setMessage: s.setMessage,
      selectedUser: s.selectedUser,
      isMobileListView: s.isMobileListView,
    }));
  const { mutate: sendMessageToWhatsApp, isPending } = useSendWhatsappMessage();
  const { fetchAllUserMessages } = useFetchAllUsers();
  const { fetchUserChats } = useFetchUserChats();

  const sendMessage = () => {
    if (!selectedUser) {
      toast.error("Select a user to send a message");
      return;
    }

    const payload = {
      ownerId,
      businessId,
      text: message,
      userId: selectedUser._id,
      isOwner: true,
      phoneNumber: selectedUser.phone,
    };
    sendMessageToWhatsApp(payload);
    setMessage("");
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || message.trim()?.length === 0) return null;
    sendMessage();
  };

  useQuery({
    queryKey: ["fetchSubscribers"],
    queryFn: fetchAllUserMessages,
    refetchInterval: 1000,
  });

  useQuery({
    queryKey: ["fetchUserChats", selectedUser?._id],
    queryFn: fetchUserChats,
    enabled: !!selectedUser,
    refetchInterval: 1000,
  });

  return (
    <main className="relative flex h-[80dvh] bg-gray-100 shadow-lg rounded-lg">
      {/* Sidebar */}
      <div
        className={`md:flex md:w-[380px] ${
          isMobileListView ? "flex w-full" : "hidden"
        }`}
      >
        <ChatsList />
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          !isMobileListView ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedUser === null ? (
          <center
            style={{
              backgroundImage: `url(${whatzAppDoodle})`,
            }}
            className="flex items-center justify-center w-full h-full text-2xl"
          >
            Select a user to start chatting
          </center>
        ) : (
          <>
            <ChatHistory isPending={isPending} />
            {/* Input Area */}
            <footer className="flex items-center gap-2 p-4 rounded-lg bg-gray-50">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${
                  selectedUser ? selectedUser.name : "Select a User"
                }`}
                className="flex-1 px-2 py-1 bg-white border rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim()}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200"
              >
                <BiSend className="text-green-700" size={24} />
              </button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
};

const WhatsappChats = memo(MemoWhatsappChats);
export default WhatsappChats;
