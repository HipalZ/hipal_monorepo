import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type {
  IUserGroup,
} from "@/components/types/businessData";
import { hexToRgba } from "@/components/utils/helper";
import {
  useAllUserBelongToGroup,
  useGetGroupData,
} from "@/hooks/usePeopleData";
import { memo, useCallback, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdPersonOutline } from "react-icons/md";
import GroupClients from "./groupClients";



const MemoTargetGroups = () => {
  const { groupData, groupLoading } = useGetGroupData(true);
  const {
    groupDetailsModal,
    setGroupDetailsModal,
    setSelectedGroup,
  } = useHiPeopleStore();
  const [groupUserData, setGroupUserData] = useState([]);
  const { mutateGetUserBelongToGroup, groupUserLoading } =
    useAllUserBelongToGroup();

  const handleGroupClick = useCallback(
    async (group: IUserGroup) => {
      setGroupDetailsModal(true);
      setSelectedGroup(group);
      try {
        const data = await mutateGetUserBelongToGroup(group.userIds);
        setGroupUserData(data || []);
      } catch (error) {
        console.error("Failed to fetch group users", error);
      }
    },
    [mutateGetUserBelongToGroup, setGroupDetailsModal],
  );

  if (groupLoading || groupUserLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <section className="business_system_cards_groups">
      {groupData?.map((group) => (
        <button
          type="button"
          onClick={() => handleGroupClick(group)}
          style={{
            backgroundColor: hexToRgba(group?.groupColor),
          }}
          key={group._id}
          className="w-full gap-4 p-4 mt-4 text-left rounded-2xl"
        >
          <div
            style={{
              backgroundColor: group?.groupColor,
            }}
            className="w-4 h-4 mb-1 ml-[0.1rem] rounded-full"
          />
          <div className="flex items-center gap-1">
            <MdPersonOutline size={20} />
            {group?.userIds?.length > 0 && <span>{group?.userIds?.length}</span>}
          </div>
          <h3 className="mt-1 leading-5">{group?.name}</h3>
        </button>
      ))}
      {groupDetailsModal && (
        <PopUp
          show={groupDetailsModal}
          onClose={() => setGroupDetailsModal(false)}
          hide
        >
          <section className="h-[100dvh] lg:h-[85dvh] overflow-auto">
            <div className="w-full h-6 -mb-6 bg-[#f4f4f4] md:hidden lg:hidden" />
            <div className="absolute top-0 w-full bg-white h-[11rem] z-0 lg:hidden" />
            <MemoizedHeader
              onBack={() => setGroupDetailsModal(false)}
              leftIcon={<FaArrowLeft />}
              isIconBusinessShow={false}
            />
          <GroupClients groupUserData={groupUserData} />
            
       
          </section>
        </PopUp>
      )}
    </section>
  );
};

const TargetGroups = memo(MemoTargetGroups);

export default TargetGroups;
