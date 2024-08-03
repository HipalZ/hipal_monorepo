import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { memo } from "react";
import { BiRightArrow } from "react-icons/bi";
import { FaMoneyBills } from "react-icons/fa6";
import { IoMdArrowRoundForward } from "react-icons/io";
import { SlLocationPin } from "react-icons/sl";

const userArray = [
  {
    _id: "1",
    name: "Rishabh Hurshan",
    number: "8668229890",
    visits: "21",
    payment: "200",
  },
  {
    _id: "2",
    name: "Sankalesh Harak",
    number: "9309544032",
    visits: "25",
    payment: "400",
  },
];

const MemoClient = () => {
  const { selectedUserIds, toggleUserSelection, selectAllUsers, clearAllUsers } = useHiPeopleStore();
  const allSelected = selectedUserIds.length === userArray.length;

  const handleSelectUser = (id: string) => {
    toggleUserSelection(id);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearAllUsers();
    } else {
      selectAllUsers(userArray.map((user) => user._id));
    }
  };

  return (
    <div className="my-4">
      <div className="flex items-center mb-4 ml-10">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          className="mr-2 checkbox checkbox-black"
        />
        <span className="text-[#6F649B]">Select {selectedUserIds.length}</span>
      </div>
      {userArray.map((user) => (
        <article
          key={user._id}
          className="relative flex items-center justify-between p-4 mx-6 mb-4 bg-white rounded-2xl"
        >
          <section className="flex items-center">
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user._id)}
              onChange={() => handleSelectUser(user._id)}
              className="mr-2 checkbox checkbox-black"
            />
            <div>
              <h3>{user.name}</h3>
              <p>{user.number}</p>
            </div>
          </section>
          <div className="flex items-center gap-2 text-[#6F649B]">
            <SlLocationPin />
            {user.visits} visits
            <FaMoneyBills />
            {user.payment}
          </div>
          <IoMdArrowRoundForward size={24} className="absolute -rotate-45 top-1 right-1" />
        </article>
      ))}
    </div>
  );
};

const Client = memo(MemoClient);
export default Client;
