import { memo } from 'react';
import { BiShoppingBag } from 'react-icons/bi'; // Ensure you have 'react-icons' installed
import { MdAdd } from 'react-icons/md';
import type { SettlePageTypes } from '../settle/type';

function ClaimCoinzSelector({
  billData,
  users,
  selectedUser,
  setSelectedUser,
  setIsUserModalOpen,
  setIsModalOpen,
  handlePhoneNumberChange2,
  setFootButton,
}) {
  const addNumberToClaimCoinz = () => {
    const btn: SettlePageTypes = 'HI_COINS';
    setIsUserModalOpen(false);
    setIsModalOpen(true);
    setFootButton(btn);
    setSelectedUser(null);
  };

  return (
    <div className="relative pb-12">
      <div className="mx-6 mt-4 flex justify-between text-sm font-semibold">
        <div>Select the users to claim coinz</div>
        <div>₹ {billData.Total}</div>
      </div>
      <div className="pb-[7rem]">
        {users.map((user) => (
          <div
            key={user.customerPhone}
            className={`mx-6 mb-3 mt-4 flex items-center rounded-xl px-2 py-2 ${
              selectedUser === user.customerPhone ? 'border-primary border-2' : 'border border-[#cacaca]'
            }`}
            onClick={() => setSelectedUser(user.customerPhone)}
          >
            <input
              type="radio"
              name="users"
              value={user.customerPhone}
              checked={selectedUser === user.customerPhone}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="cursor-pointer"
            />
            <label className="ml-3 cursor-pointer text-sm font-medium">{user.customerName}</label>
          </div>
        ))}
        <div
          onClick={addNumberToClaimCoinz}
          className="mx-6 mb-3 mt-4 flex cursor-pointer items-center rounded-xl border border-[#cacaca] px-2 py-2 text-sm"
        >
          <MdAdd className="mr-2" />
          <span>Add new user</span>
        </div>
      </div>

      <div className="bg-primary fixed bottom-0 flex h-16 w-full items-center justify-between px-5">
        <div className="flex items-center">
          <BiShoppingBag color="#fff" size={24} />
          <h1 className="text-base-100 mx-2 text-sm font-semibold">Hi Coinz added</h1>
        </div>
        <button
          type="button"
          onClick={() => handlePhoneNumberChange2(selectedUser)}
          className="text-primary bg-base-100 rounded-full px-9 py-3 font-semibold leading-[1.15rem]"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default memo(ClaimCoinzSelector);
