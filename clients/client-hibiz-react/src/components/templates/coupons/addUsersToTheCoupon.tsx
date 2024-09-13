import { memo, useCallback, useState, useMemo } from "react";
import useCouponsStore from "@/components/store/useCouponsStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import NoData from "@/assets/nodata.jpg";
import { useGetAllPeoples, useGetGroupData } from "@/hooks/usePeopleData";
import { MdPersonOutline } from "react-icons/md";
import { cn } from "@hi/common";
import { hexToRgba } from "@/components/utils/helper";
import type { IUserGroup } from "@/components/types/businessData";
import BottomButton from "@/components/atom/bottomButton";

const UserGroupList = ({ type }: { type: "people" | "group" }) => {
  const {
    selectedUserIds,
    selectedGroupIds,
    setSelectedUserIds,
    setSelectedGroupIds,
    setEligibilityModal,
  } = useCouponsStore((s) => ({
    selectedUserIds: s.selectedUserIds,
    selectedGroupIds: s.selectedGroupIds,
    setSelectedUserIds: s.setSelectedUserIds,
    setSelectedGroupIds: s.setSelectedGroupIds,
    setEligibilityModal: s.setEligibilityModal,
  }));

  const [tempSelectedUserIds, setTempSelectedUserIds] =
    useState<string[]>(selectedUserIds);
  const [tempSelectedGroupIds, setTempSelectedGroupIds] =
    useState<string[]>(selectedGroupIds);

  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading: isUserLoading, peopleData } = useGetAllPeoples();
  const { groupData, groupLoading } = useGetGroupData(type === "group");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = useMemo(() => {
    if (!peopleData) return [];
    return peopleData.filter(
      (user) =>
        user?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.userId?.phone?.includes(searchTerm),
    );
  }, [peopleData, searchTerm]);

  const filteredGroups = useMemo(() => {
    if (!groupData) return [];
    return groupData.filter((group) =>
      group?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [groupData, searchTerm]);

  const handleUserClick = useCallback(
    (userId: string) => {
      if (tempSelectedGroupIds.length > 0) {
        setTempSelectedGroupIds([]);
      }
      if (tempSelectedUserIds.includes(userId)) {
        setTempSelectedUserIds(
          tempSelectedUserIds.filter((id) => id !== userId),
        );
      } else {
        setTempSelectedUserIds([...tempSelectedUserIds, userId]);
      }
    },
    [tempSelectedGroupIds, tempSelectedUserIds],
  );

  const handleGroupClick = useCallback(
    (group: IUserGroup) => {
      if (tempSelectedUserIds.length > 0) {
        setTempSelectedUserIds([]);
      }
      if (tempSelectedGroupIds.includes(group._id)) {
        setTempSelectedGroupIds(
          tempSelectedGroupIds.filter((id) => id !== group._id),
        );
      } else {
        setTempSelectedGroupIds([...tempSelectedGroupIds, group._id]);
      }
    },
    [tempSelectedGroupIds, tempSelectedUserIds],
  );

  const handleSaveSelection = () => {
    setSelectedUserIds(tempSelectedUserIds);
    setSelectedGroupIds(tempSelectedGroupIds);
    setEligibilityModal(false);
  };

  if (isUserLoading || groupLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  if (type === "people" && !peopleData?.length)
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh]">
        <img src={NoData} alt="No Data Found" className="w-1/2 h-auto" />
        <h3 className="text-[#6F649B] mt-4">No People Data Found</h3>
      </div>
    );

  if (type === "group" && !groupData?.length)
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh]">
        <img src={NoData} alt="No Data Found" className="w-1/2 h-auto" />
        <h3 className="text-[#6F649B] mt-4">No Group Data Found</h3>
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
          <div className="flex flex-wrap gap-4 pb-[7rem]">
            {filteredUsers.map((user) => (
              <button
                type="button"
                key={user._id}
                onClick={() => handleUserClick(user?.userId?._id)}
                className={cn(
                  "flex items-center border-b border-[#00000050] pb-2 w-full text-left md:max-w-[14rem] lg:max-w-[14rem]",
                  tempSelectedUserIds.includes(user?.userId?._id) ? "" : "",
                )}
              >
                <input
                  type="checkbox"
                  checked={tempSelectedUserIds.includes(user?.userId?._id)}
                  onChange={() => handleUserClick(user?.userId?._id)}
                  className="mr-2 text-black rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <h3>{user?.userId?.name}</h3>
                  <p>
                    {user?.userId?.phone?.slice(0, 2)}******
                    {user?.userId?.phone?.slice(-2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {type === "group" && (
          <div className="flex flex-wrap gap-4 pb-[7rem]">
            {filteredGroups.map((group) => (
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                style={{
                  backgroundColor: hexToRgba(group?.groupColor),
                }}
                key={group._id}
                className={cn(
                  "relative flex items-center gap-4 px-4 py-2 text-left w-full rounded-2xl md:max-w-[14rem] lg:max-w-[14.25rem]",
                  tempSelectedGroupIds.includes(group._id)
                    ? "border border-green-500"
                    : "",
                )}
              >
                <input
                  type="checkbox"
                  checked={tempSelectedGroupIds.includes(group._id)}
                  onChange={() => handleGroupClick(group)}
                  className="mr-2 text-black rounded-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  style={{
                    backgroundColor: group?.groupColor,
                  }}
                  className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 mb-1 ml-[0.1rem] rounded-full"
                />
                <h3 className="leading-5 w-[80%] ml-2">{group?.name}</h3>
                <div className="flex items-center ml-4 left-6 top-3">
                  <MdPersonOutline size={20} />
                  {group?.userIds?.length > 0 && (
                    <span>{group?.userIds?.length}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
      <BottomButton
        buttons={[
          {
            text: "Add",
            onClick: handleSaveSelection,
          },
        ]}
        fixed
      />
    </>
  );
};

const MemoUserGroupList = memo(UserGroupList);
export default MemoUserGroupList;
