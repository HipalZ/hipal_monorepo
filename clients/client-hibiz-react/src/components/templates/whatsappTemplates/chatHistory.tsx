import whatzAppDoodle from '@/assets/whatzapp/whatsappdoodle.jpg';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import type { IWhatsAppMessage } from '@/components/types/businessData';
import { useDeleteChats, useFetchUserChatsInfinite } from '@/hooks/useTemplates';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiArrowBack, BiCheckDouble, BiDownload, BiFile, BiHide, BiShow, BiTrash } from 'react-icons/bi';
import { RxAvatar } from 'react-icons/rx';

const MemoChatHistory = ({ isPending }: { isPending: boolean }) => {
  const ownerId = useOwnerLogin((s) => s.user?._id);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isChatsLoading } = useFetchUserChatsInfinite();

  const selectedUser = useWhatsappTempStore((s) => s.selectedUser);
  const isMobileListView = useWhatsappTempStore((s) => s.isMobileListView);
  const setIsMobileListView = useWhatsappTempStore((s) => s.setIsMobileListView);

  const [isMasked, setIsMasked] = useState(true);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, fetchNextPage]);

  const visibleMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page.data);
  }, [data]);

  const { mutate: deleteChats } = useDeleteChats();

  const handleDeleteUserChat = useCallback(
    (userId: string) => {
      if (confirm('Are you sure you want to delete this chat?')) {
        deleteChats({ userId, ownerId });
      }
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

  // Helper to mask phone number
  const getDisplayedPhone = () => {
    const phone = selectedUser?.phone;
    if (!phone) return 'Tap here for contact info';
    if (!isMasked) return phone;
    // Mask all but last 4 digits
    const visibleDigits = 4;
    if (phone.length <= visibleDigits) return phone;
    return '*'.repeat(phone.length - visibleDigits) + phone.slice(-visibleDigits);
  };

  const renderMessageContent = (chat: IWhatsAppMessage) => {
    switch (chat.type) {
      case 'image':
        return (
          <div className="mb-1">
            <img src={chat.mediaUrl} alt="Shared-image" className="max-h-[300px] w-full rounded-lg object-cover" loading="lazy" />
          </div>
        );
      case 'video':
        return (
          <div className="mb-1">
            <video src={chat.mediaUrl} controls className="max-h-[300px] w-full rounded-lg" />
          </div>
        );
      case 'document':
        return (
          <a
            href={chat.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-3 rounded-lg bg-black/5 p-3 transition-colors hover:bg-black/10"
          >
            <div className="rounded bg-red-100 p-2 text-red-500">
              <BiFile size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{chat.filename || 'Document'}</p>
              <p className="text-xs uppercase text-gray-500">{chat.mediaUrl?.split('.').pop()}</p>
            </div>
            <BiDownload size={20} className="text-gray-500" />
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden bg-[#efe7dd]"
      role="log"
      aria-label="Message list"
      style={{
        backgroundImage: `url(${whatzAppDoodle})`,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Header */}
      <nav className="sticky top-0 z-10 flex h-[60px] items-center justify-between bg-[#f0f2f5] px-4 py-2 shadow-sm">
        <section className="flex items-center gap-3 overflow-hidden">
          <button type="button" className="mr-1 text-[#54656f] md:hidden" onClick={toggleMobileView}>
            <BiArrowBack size={24} />
          </button>
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <RxAvatar className="h-full w-full text-gray-400" />
          </div>
          <article className="flex flex-col justify-center">
            <h1 className="truncate text-base font-medium text-[#111b21]">{selectedUser ? selectedUser.name : 'Select a User'}</h1>
            <div className="flex items-center gap-2">
              <p className="truncate text-xs text-[#667781]">{getDisplayedPhone()}</p>
              {selectedUser?.phone && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMasked(!isMasked);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isMasked ? <BiShow size={14} /> : <BiHide size={14} />}
                </button>
              )}
            </div>
          </article>
        </section>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => selectedUser?._id && handleDeleteUserChat(selectedUser._id)}
            className="rounded-full p-2 text-[#54656f] transition-colors hover:bg-gray-200"
            title="Delete Chat"
          >
            <BiTrash size={20} />
          </button>
        </div>
      </nav>

      {/* Messages Area */}
      <div className="flex flex-1 flex-col-reverse overflow-y-auto p-4 md:p-8">
        {visibleMessages && visibleMessages.length > 0 ? (
          visibleMessages.map((chat, index) => (
            <article key={chat?._id || index} className={`mb-2 flex w-full ${chat?.isOwner ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`flex max-w-[85%] flex-col rounded-lg p-2 shadow-sm md:max-w-[65%] ${
                  chat?.isOwner ? 'rounded-tr-none bg-[#d9fdd3]' : 'rounded-tl-none bg-white'
                }`}
              >
                {/* Render Media Content */}
                {renderMessageContent(chat)}

                {/* Message Text & Metadata */}
                <div className="relative flex flex-wrap items-end gap-2">
                  <p className="min-w-[60px] whitespace-pre-wrap break-words pb-1 text-sm text-[#111b21]">
                    {(chat?.type === 'document' || chat?.type === 'image' || chat?.type === 'video') && chat.caption ? chat.caption : chat?.message}
                    {isPending && index === 0 && '...'}
                  </p>

                  <div className="ml-auto flex items-center gap-1 text-[11px] text-[#667781]">
                    <time>{formatMessageDate(chat?.date)}</time>
                    {chat?.isOwner && <BiCheckDouble className="text-[#53bdeb]" size={16} />}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : isChatsLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00a884] border-t-transparent" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8696a0]">
            <p className="rounded-lg bg-[#fff5c4] px-3 py-1 shadow-sm">Send a message to start chatting</p>
          </div>
        )}

        {/* Sentinel for infinite scroll trigger - placed at end of DOM list (visual top in flex-col-reverse) */}
        <div ref={observerTarget} className="h-1 w-full" />

        {/* Loading spinner at the top (which is end of list in flex-col-reverse) */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />
          </div>
        )}
      </div>
    </section>
  );
};

const ChatHistory = memo(MemoChatHistory);
export default ChatHistory;
