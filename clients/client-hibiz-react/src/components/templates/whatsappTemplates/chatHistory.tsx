import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useDeleteChats, useFetchUserChats } from '@/hooks/useTemplates';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback } from 'react';
import { BiArrowBack, BiCheck, BiTrash } from 'react-icons/bi';
import { RxAvatar } from 'react-icons/rx';

const MemoChatHistory = ({ isPending }: { isPending: boolean }) => {
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const { fetchUserChats } = useFetchUserChats();

  const { selectedUser, userChat, isMobileListView, setIsMobileListView } = useWhatsappTempStore((s) => ({
    selectedUser: s.selectedUser,
    userChat: s.userChat,
    isMobileListView: s.isMobileListView,
    setIsMobileListView: s.setIsMobileListView,
  }));
  const { mutate: deleteChats } = useDeleteChats();

  const handleDeleteUserChat = useCallback(
    (userId: string) => {
      deleteChats({ userId, ownerId });
    },
    [deleteChats, ownerId],
  );

  const formatMessageDate = useCallback((date: number) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const toggleMobileView = useCallback(() => {
    setIsMobileListView(!isMobileListView);
  }, [isMobileListView, setIsMobileListView]);

  const { isLoading: isChatsLoading } = useQuery({
    queryKey: ['fetchUserChats', selectedUser?._id],
    queryFn: fetchUserChats,
    enabled: !!selectedUser,
    refetchInterval: 5000,
  });

  return (
    <section
      className="flex-1 overflow-y-auto"
      role="log"
      aria-label="Message list"
      style={{
        backgroundImage: `url(${whatzAppDoodle})`,
      }}
    >
      <nav className="sticky top-0 flex h-[4rem] items-center justify-between gap-4 bg-gray-200 p-2">
        <section className="flex items-center gap-4 overflow-hidden rounded-full">
          <button type="button" className="bg-gray-200 p-2 text-gray-600 md:hidden" onClick={toggleMobileView}>
            <BiArrowBack size={24} />
          </button>
          <RxAvatar size={60} />
          <article className="w-full">
            <h1>{selectedUser ? selectedUser.name : 'Select a User'}</h1>
            <p>{selectedUser?.phone}</p>
          </article>
        </section>
        <div className="justify-end">
          <button
            type="button"
            onClick={() => selectedUser?._id && handleDeleteUserChat(selectedUser._id)}
            className="rounded-full bg-red-100 p-2 hover:bg-red-200"
          >
            <BiTrash className="text-red-700" size={24} />
          </button>
        </div>
      </nav>

      <div className="space-y-4 p-4">
        {userChat
          ? userChat?.map((chat, index) => (
              <article key={chat?._id} className={`flex ${chat?.isOwner ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${chat?.isOwner ? 'bg-green-500 text-white' : 'bg-white text-gray-900'}`}>
                  <p>{isPending && index === userChat.length - 1 ? 'Sending ...' : chat?.message}</p>
                  <div className={`mt-1 flex items-center gap-1 text-xs ${chat?.isOwner ? 'text-green-100' : 'text-gray-500'}`}>
                    <time>{formatMessageDate(chat?.date)}</time>
                    {chat?.isOwner && <BiCheck className="inline h-4 w-4" />}
                  </div>
                </div>
              </article>
            ))
          : isChatsLoading && <p>Loading...</p>}
      </div>
    </section>
  );
};

const ChatHistory = memo(MemoChatHistory);
export default ChatHistory;
