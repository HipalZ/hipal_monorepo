import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useFetchSubscribersInfinite, useSearchUserByPhone } from '@/hooks/useTemplates';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { RxAvatar } from 'react-icons/rx';

const MemoChatsList = () => {
  const users = useWhatsappTempStore((s) => s.users);
  const setUsers = useWhatsappTempStore((s) => s.setUsers);
  const setSelectedUser = useWhatsappTempStore((s) => s.setSelectedUser);
  const selectedUser = useWhatsappTempStore((s) => s.selectedUser);
  const setIsMobileListView = useWhatsappTempStore((s) => s.setIsMobileListView);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFetchSubscribersInfinite();

  const { searchUserByPhone } = useSearchUserByPhone();
  const [searchNumber, setSearchNumber] = useState('');

  // Sync data to store
  useEffect(() => {
    if (data?.pages) {
      const allUsers = data.pages.flatMap((page: any) => page.data);
      setUsers(allUsers);

      // Update selectedUser if it exists in the new data to reflect changes (like lastUserMessageAt)
      if (selectedUser) {
        const updatedUser = allUsers.find((u: any) => u.userId._id === selectedUser._id);
        if (updatedUser && updatedUser.lastUserMessageAt !== selectedUser.lastUserMessageAt) {
          setSelectedUser({
            ...updatedUser.userId,
            lastUserMessageAt: updatedUser.lastUserMessageAt,
          });
        }
      }
    }
  }, [data, setUsers, selectedUser, setSelectedUser]);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
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

  const handleUserClick = useCallback(
    (user) => {
      setSelectedUser({
        ...user.userId,
        lastUserMessageAt: user.lastUserMessageAt,
      });
      setIsMobileListView(false);
    },
    [setSelectedUser, setIsMobileListView],
  );

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
      setSearchNumber(value);

      // If a 10-digit number is entered, call the API to fetch the user
      if (value.length === 10) {
        searchUserByPhone(value).then((res) => {
          if (res?.data) {
            const foundUser = res.data;
            // Ensure we handle potential undefined userId structure in existing list safely
            const isUserInList = users.some((u) => u?.userId?._id === foundUser?.userId?._id);

            if (!isUserInList) {
              setUsers([foundUser, ...users]);
            }
            setSearchNumber(value);
          }
        });
      }
    },
    [searchUserByPhone, users, setUsers],
  );

  // Use useMemo to filter users based on searchNumber
  const filteredUsers = useMemo(() => {
    if (searchNumber.length === 10) {
      return users.filter((user) => user?.userId?.phone === searchNumber);
    }
    return users;
  }, [searchNumber, users]);

  return (
    <aside className="h-full w-full border-r border-gray-200 bg-white md:flex md:flex-col">
      <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
        <h1 className="text-xl font-bold text-[#111b21]">Chats</h1>
      </header>

      <div className="mx-3 my-2 flex-shrink-0">
        <div className="relative flex items-center rounded-lg bg-[#f0f2f5] px-3 py-1.5 transition-all focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-[#00a884]">
          <BiSearch className="mr-3 h-5 w-5 text-[#54656f] transition-colors focus-within:text-[#00a884]" />
          <input
            type="search"
            value={searchNumber}
            maxLength={10}
            onChange={handleSearchChange}
            className="w-full rounded-lg border-none bg-transparent text-sm text-[#3b4a54] placeholder-[#54656f] outline-none focus:border-none focus:outline-none focus:ring-0"
            placeholder="Search phone number"
          />
        </div>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto">
        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <article
              key={user.userId._id}
              onClick={() => handleUserClick(user)}
              className={`group relative flex cursor-pointer items-center gap-3 border-b border-[#f0f2f5] p-3 transition-colors hover:bg-[#f5f6f6] ${
                selectedUser?._id === user.userId._id ? 'bg-[#f0f2f5]' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 overflow-hidden rounded-full">
                  <RxAvatar className="h-full w-full text-gray-400" />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <h3 className="truncate text-[16px] font-medium text-[#111b21]">{user?.userId?.name || 'Unknown User'}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-[#667781] group-hover:text-[#3b4a54]">
                    {user?.userId?.phone ? `******${user.userId.phone.slice(-4)}` : ''}
                  </p>
                  {user?.whatsappMsgUnseenCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#25d366] px-1.5 text-xs font-bold text-white shadow-sm">
                      {user?.whatsappMsgUnseenCount}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />
            <p className="mt-2 text-sm text-gray-500">Loading chats...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-gray-500">
            <p className="text-sm">No active chats found.</p>
            <p className="mt-1 text-xs">Start a conversation by searching.</p>
          </div>
        )}

        {/* Loader for infinite scroll */}
        {filteredUsers && filteredUsers.length > 0 && (
          <div ref={observerTarget} className="flex h-4 w-full items-center justify-center py-4">
            {isFetchingNextPage && <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />}
          </div>
        )}
      </nav>
    </aside>
  );
};

const ChatsList = memo(MemoChatsList);
export default ChatsList;
