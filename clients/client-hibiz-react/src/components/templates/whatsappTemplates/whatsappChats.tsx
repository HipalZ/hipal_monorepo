import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useSendWhatsappMessage } from '@/hooks/useTemplates';
import { lazy, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { BiSend } from 'react-icons/bi';

const ChatsList = lazy(() => import('./chatsList'));
const ChatHistory = lazy(() => import('./chatHistory'));

const MemoWhatsappChats = () => {
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { message, setMessage, selectedUser, isMobileListView } = useWhatsappTempStore((s) => ({
    message: s.message,
    setMessage: s.setMessage,
    selectedUser: s.selectedUser,
    isMobileListView: s.isMobileListView,
  }));
  const { mutate: sendMessageToWhatsApp, isPending } = useSendWhatsappMessage();

  const sendMessage = () => {
    if (!selectedUser) {
      toast.error('Select a user to send a message');
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
    setMessage('');
  };

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    [setMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || message.trim()?.length === 0) return null;
      sendMessage();
    },
    [message, sendMessage],
  );

  return (
    <section className="relative flex h-[85dvh] rounded-lg bg-gray-100 shadow-lg">
      {/* Sidebar */}
      <div className={`md:flex md:w-[380px] ${isMobileListView ? 'flex w-full' : 'hidden'}`}>
        <ChatsList />
      </div>

      {/* Main Chat Area */}
      <div className={`flex flex-1 flex-col ${!isMobileListView ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser === null ? (
          <center
            style={{
              backgroundImage: `url(${whatzAppDoodle})`,
            }}
            className="flex h-full w-full items-center justify-center text-2xl"
          >
            Select a user to start chatting
          </center>
        ) : (
          <>
            <ChatHistory isPending={isPending} />
            {/* Input Area */}
            <footer className="flex items-center gap-2 rounded-lg bg-gray-50 p-4">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedUser ? selectedUser.name : 'Select a User'}`}
                className="flex-1 rounded-lg border bg-white px-2 py-1 focus:ring-2 focus:ring-green-500"
              />
              <button type="button" onClick={sendMessage} disabled={!message.trim()} className="rounded-full bg-green-100 p-2 hover:bg-green-200">
                <BiSend className="text-green-700" size={24} />
              </button>
            </footer>
          </>
        )}
      </div>
    </section>
  );
};

const WhatsappChats = memo(MemoWhatsappChats);
export default WhatsappChats;
