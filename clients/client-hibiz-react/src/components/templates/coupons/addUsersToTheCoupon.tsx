import { memo, useCallback, useState, useMemo } from "react";
import useCouponsStore from "@/components/store/useCouponsStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import NoData from "@/assets/nodata.jpg";
import { useGetGroupData } from "@/hooks/usePeopleData";
import { MdPersonOutline } from "react-icons/md";
import { cn } from "@hi/common";
import { hexToRgba } from "@/components/utils/helper";
import BottomButton from "@/components/atom/bottomButton";
import {
  type selectedUsersDetails,
  useSingleUserInfo,
} from "@/hooks/useCoupon";
import Background from "@/components/atom/feildBackground";

const UserGroupList = ({ type }: { type: "people" | "group" }) => {
  const {
    selectedUserIds,
    selectedGroupIds,
    setSelectedUserIds,
    setSelectedGroupIds,
    setEligibilityModal,
    selectedUsers,
    setSelectedUsers,
  } = useCouponsStore((s) => ({
    selectedUserIds: s.selectedUserIds,
    selectedGroupIds: s.selectedGroupIds,
    setSelectedUserIds: s.setSelectedUserIds,
    setSelectedGroupIds: s.setSelectedGroupIds,
    setEligibilityModal: s.setEligibilityModal,
    selectedUsers: s.selectedUsers,
    addUser: s.addUser,
    removeUser: s.removeUser,
    setSelectedUsers: s.setSelectedUsers,
  }));

  const [tempSelectedUserIds, setTempSelectedUserIds] =
    useState<string[]>(selectedUserIds);
  const [tempSelectedGroupIds, setTempSelectedGroupIds] =
    useState<string[]>(selectedGroupIds);
  const [tempSelectedUsers, setTempSelectedUsers] =
    useState<selectedUsersDetails[]>(selectedUsers);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const { isLoading: isUserLoading, userInfo } = useSingleUserInfo(phone);
  const { groupData, groupLoading } = useGetGroupData(type === "group");

  console.log("Group Data:", userInfo);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      setPhone(/^\d{10}$/.test(value) ? value : "");
    },
    [],
  );

  const filteredGroups = useMemo(() => {
    return (
      groupData?.filter((group) =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    );
  }, [groupData, searchTerm]);

  const handleUserClick = useCallback(
    (userDetails: selectedUsersDetails) => {
      setTempSelectedGroupIds([]);

      setTempSelectedUserIds((prevSelectedUserIds) => {
        const isSelected = prevSelectedUserIds.includes(userDetails._id);
        return isSelected
          ? prevSelectedUserIds.filter((id) => id !== userDetails._id)
          : [...prevSelectedUserIds, userDetails._id];
      });

      const isSelected = tempSelectedUsers.some(
        (u) => u._id === userDetails._id,
      );

      if (isSelected) {
        setTempSelectedUsers((prev) =>
          prev.filter((u) => u._id !== userDetails._id),
        );
      } else {
        setTempSelectedUsers((prev) => {
          if (!prev.some((u) => u._id === userDetails._id)) {
            return [...prev, userDetails];
          }
          return prev;
        });
      }
    },
    [tempSelectedUsers, setTempSelectedUserIds, setTempSelectedGroupIds],
  );

  const handleGroupClick = useCallback((groupId: string) => {
    setTempSelectedUserIds([]);
    setTempSelectedUsers([]);
    setTempSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  }, []);
  const handleSaveSelection = useCallback(() => {
    setSelectedUserIds(tempSelectedUserIds);
    setSelectedGroupIds(tempSelectedGroupIds);
    setSelectedUsers(tempSelectedUsers);
    setEligibilityModal(false);
  }, [
    tempSelectedUserIds,
    tempSelectedGroupIds,
    tempSelectedUsers,
    setSelectedUserIds,
    setSelectedGroupIds,
    setSelectedUsers,
    setEligibilityModal,
  ]);

  if (isUserLoading || groupLoading) {
    return <LoadingSpinner />;
  }

  const renderNoData = (message: string) => (
    <div className="flex flex-col items-center justify-center h-[70dvh]">
      <img src={NoData} alt="No Data Found" className="w-1/2 h-auto" />
      <h3 className="text-[#6F649B] mt-4">{message}</h3>
    </div>
  );

  return (
    <>
      <section className="relative mx-6">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={`Search by ${
            type === "people" ? "name or phone" : "group name"
          }`}
          className="w-full px-4 py-2 mt-6 mb-4 border rounded-2xl"
        />

        {type === "people" && (
          <>
            {userInfo?._id ? (
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => handleUserClick(userInfo)}
                  className={cn(
                    "flex items-center border-b border-[#00000050] pb-2 w-full text-left md:max-w-[14rem] lg:max-w-[14rem]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedUserIds.includes(userInfo._id)}
                    onChange={() => handleUserClick(userInfo)}
                    className="mr-2 text-black rounded-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <h3>{userInfo.name}</h3>
                    <p>{`${userInfo.phone.slice(
                      0,
                      2,
                    )}******${userInfo.phone.slice(-2)}`}</p>
                  </div>
                </button>
              </div>
            ) : tempSelectedUsers?.length > 0 ? (
              <Background className="flex flex-wrap gap-4">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="relative flex items-center bg-[#6F649B] text-white rounded-2xl px-4 py-2"
                  >
                    <div>
                      <h3>{user.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUserClick(user)}
                      className="absolute flex items-center justify-center border border-[#6F649B] w-6 h-6 text-[#6F649B] bg-white rounded-full -top-1.5 -right-1.5"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </Background>
            ) : (
              <div>No user Found ....</div>
            )}
          </>
        )}

        {type === "group" && (
          <>
            {filteredGroups.length > 0 ? (
              <div className="flex flex-wrap gap-4 pb-[7rem]">
                {filteredGroups.map((group) => (
                  <button
                    type="button"
                    onClick={() => handleGroupClick(group._id)}
                    style={{ backgroundColor: hexToRgba(group.groupColor) }}
                    key={group._id}
                    className={cn(
                      "relative flex items-center gap-4 px-4 py-4 text-left w-full rounded-2xl md:max-w-[14rem] lg:max-w-[14.25rem]",
                      tempSelectedGroupIds.includes(group._id)
                        ? "border border-green-500"
                        : "",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedGroupIds.includes(group._id)}
                      onChange={() => handleGroupClick(group._id)}
                      className="mr-2 text-black rounded-sm"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <h3 className="leading-5 w-[90%] ml-2 line-clamp-2">
                      {group.name}
                    </h3>
                    <div className="flex items-center ml-4 left-6 top-3">
                      <MdPersonOutline size={20} />
                      {group.userIds.length > 0 && (
                        <span>{group.userIds.length}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              renderNoData("No Group Data Found")
            )}
          </>
        )}
      </section>
      <BottomButton
        buttons={[
          {
            text: "Save",
            onClick: handleSaveSelection,
          },
        ]}
      />
    </>
  );
};

const MemoUserGroupList = memo(UserGroupList);
export default MemoUserGroupList;
