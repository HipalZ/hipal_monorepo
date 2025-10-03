import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { useFetchAllUsers, useSearchUserByPhone } from '@/hooks/useTemplates';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useMemo, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { RxAvatar } from 'react-icons/rx';

const MemoChatsList = () => {
  const { users, setSelectedUser, selectedUser, setIsMobileListView } = useWhatsappTempStore((s) => ({
    users: s.users,
    setSelectedUser: s.setSelectedUser,
    selectedUser: s.selectedUser,
    setIsMobileListView: s.setIsMobileListView,
  }));
  const { fetchAllUserMessages } = useFetchAllUsers();
  const { searchUserByPhone } = useSearchUserByPhone();
  const [searchNumber, setSearchNumber] = useState('');

  const handleUserClick = useCallback(
    (user) => {
      setSelectedUser(user.userId);
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
        searchUserByPhone(value).then((user) => {
          if (user?.data) {
            // Directly show the filtered user based on the fetched user
            setSearchNumber(value); // Optional: reset search input to the correct phone number
          }
        });
      }
    },
    [searchUserByPhone],
  );

  // Use useMemo to filter users based on searchNumber
  const filteredUsers = useMemo(() => {
    if (searchNumber.length === 10) {
      return users.filter((user) => user?.userId?.phone === searchNumber);
    }
    return users; // Return all users if searchNumber is empty or less than 10
  }, [searchNumber, users]);

  const { isLoading: isUserMessages } = useQuery({
    queryKey: ['fetchSubscribers'],
    queryFn: fetchAllUserMessages,
    refetchInterval: 5000,
  });

  return (
    <aside className="w-full flex-col rounded-lg border-r bg-gray-50 md:flex md:w-[380px]">
      <header className="flex items-center justify-between rounded-l-lg bg-gray-50 px-4 pt-3">
        <h1 className="text-xl font-semibold">Chats</h1>
      </header>
      <div className="p-3 shadow-md">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
          <input
            type="search"
            value={searchNumber}
            maxLength={10}
            onChange={handleSearchChange}
            className="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Search Phone Number"
          />
        </div>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto">
        {filteredUsers
          ? filteredUsers.map((user) => (
              <article
                key={user.userId._id}
                onClick={() => handleUserClick(user)}
                className={`flex cursor-pointer items-center gap-3 border-b border-gray-200 p-3 hover:bg-gray-100 ${
                  selectedUser?._id === user.userId._id ? 'bg-green-200' : ''
                }`}
              >
                <div className="flex-shrink-0 overflow-hidden rounded-full">
                  <RxAvatar size={48} />
                </div>
                <div className="flex-1">
                  <h3 className="truncate font-medium">{user?.userId?.name}</h3>
                </div>
                {user?.whatsappMsgUnseenCount > 0 && <span className="text-sm text-green-500">{user?.whatsappMsgUnseenCount}</span>}
              </article>
            ))
          : isUserMessages && <p>Loading...</p>}
      </nav>
    </aside>
  );
};

const ChatsList = memo(MemoChatsList);
export default ChatsList;
