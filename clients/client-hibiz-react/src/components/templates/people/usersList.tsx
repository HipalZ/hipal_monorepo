import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { ICustomerRecord } from "@/components/types/businessData";
import { useGetAllPeoples } from "@/hooks/usePeopleData";
import { memo, useCallback } from "react";
import { FaMoneyBills } from "react-icons/fa6";
import { MdArrowOutward } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { Link } from "react-router-dom";

const MemoUsersList = ({ hide }: { hide?: boolean }) => {
  const {
    toggleUserSelection,
    selectAllUsers,
    clearAllUsers,
    selectedUserIds,
    setAddGroupPage,
  } = useHiPeopleStore();

  const { isLoading, peopleData } = useGetAllPeoples();

  const allSelected = selectedUserIds.length === peopleData?.length;

  const handleSelectUser = useCallback((id: string) => {
    toggleUserSelection(id);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clearAllUsers();
    } else {
      selectAllUsers(peopleData?.map((user) => user?.userId?._id));
    }
  }, [allSelected, selectedUserIds]);

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  return (
    <>
      {" "}
      <div className="flex items-center mb-4 ml-8">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          className="mr-2 checkbox checkbox-black"
        />
        <span className="text-[#6F649B]">Select {selectedUserIds.length}</span>
      </div>
      <section className="flex flex-wrap justify-start pb-[7rem] gap-4 mx-4 lg:pb-[5rem]">
        {peopleData?.map((user: ICustomerRecord) => (
          <article
            key={user._id}
            className="relative flex items-center justify-between w-full p-4 bg-white rounded-2xl max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
          >
            <section className="flex items-center">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user?.userId?._id)}
                onChange={() => handleSelectUser(user?.userId?._id)}
                className="w-5 h-5 mr-3 text-black rounded"
              />
              <div>
                <h3>{user?.userId?.name}</h3>
                <p>{user?.userId?.phone}</p>
              </div>
            </section>
            <div className="flex items-center gap-2 text-[#6F649B]">
              <SlLocationPin />
              {user?.visitCount} visits
              <FaMoneyBills />
              {user?.avgSpend}
            </div>
            {!hide && (
              <Link
                to={`/app/business/${user.businessId}/people/${user.userId._id}`}
                className="absolute top-1 right-1"
              >
                <MdArrowOutward size={24} />
              </Link>
            )}
          </article>
        ))}
      </section>
      {hide && selectedUserIds.length ? (
        <BottomButton
          buttons={[
            {
              text: "Save",
              onClick: () => setAddGroupPage("CREATE GROUP"),
              type: "button",
            },
          ]}
        />
      ) : null}
    </>
  );
};

const UsersList = memo(MemoUsersList);

export default UsersList;
