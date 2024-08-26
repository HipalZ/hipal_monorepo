import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { IUserGroup } from "@/components/types/businessData";
import { hexToRgba } from "@/components/utils/helper";
import {
  useAllUserBelongToGroup,
  useGetGroupData,
} from "@/hooks/usePeopleData";
import { memo, useCallback, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdPersonOutline } from "react-icons/md";
import GroupClients from "./groupClients";
import CreateDynamicGroup from "./createDynamicGroup";
import { cn } from "@hi/common";
import NoData from "@/assets/nodata.jpg";
import AddTagToGroup from "./addTagToGroup";

const MemoTargetGroups = () => {
  const { groupData, groupLoading } = useGetGroupData(true);
  const {
    groupDetailsModal,
    setGroupDetailsModal,
    setSelectedGroup,
    selectedGroupPage,
    setSelectedGroupPage,
    reset,
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
        setSelectedGroupPage("USERS");
      } catch (error) {
        console.error("Failed to fetch group users", error);
      }
    },
    [mutateGetUserBelongToGroup, setGroupDetailsModal],
  );

  const createGroup = useCallback(() => {
    setGroupDetailsModal(true);
    setSelectedGroupPage("CREATE GROUP");
    reset();
  }, [selectedGroupPage, groupDetailsModal, reset]);

  const goBack = useCallback(() => {
    switch (selectedGroupPage) {
      case "CREATE GROUP":
        setGroupDetailsModal(false);
        break;
      case "ADD TAGS":
        setSelectedGroupPage("CREATE GROUP");
        break;
      case "USERS":
        setGroupDetailsModal(false);
        break;
      default:
        setGroupDetailsModal(false);
        break;
    }
  }, [selectedGroupPage]);

  if (groupLoading || groupUserLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <section>
        {groupData && groupData.length > 0 ? (
          <section className="business_system_cards_groups">
            {groupData.map((group) => (
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                style={{
                  backgroundColor: hexToRgba(group?.groupColor),
                }}
                key={group._id}
                className="relative w-full gap-4 p-4 text-left rounded-2xl h-[7rem]"
              >
                <div
                  style={{
                    backgroundColor: group?.groupColor,
                  }}
                  className="w-4 h-4 mb-1 ml-[0.1rem] rounded-full absolute top-4 left-4"
                />
                <div className="absolute flex items-center ml-4 left-6 top-3">
                  <MdPersonOutline size={20} />
                  {group?.userIds?.length > 0 && (
                    <span>{group?.userIds?.length}</span>
                  )}
                </div>
                <h3 className="absolute leading-5 top-10 w-[80%]">
                  {group?.name}
                </h3>
              </button>
            ))}
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70dvh]">
            <img src={NoData} alt="No Data Found" className="w-1/2 h-auto" />
            <h3 className="text-[#6F649B] mt-4">No Data Found</h3>
          </div>
        )}
        {groupDetailsModal && (
          <PopUp
            show={groupDetailsModal}
            onClose={() => setGroupDetailsModal(false)}
            hide
          >
            <section className="h-[100dvh] lg:h-[85dvh] overflow-auto lg:rounded-[1rem] hide-scrollbar">
              <article className="sticky top-0 z-50 bg-white">
                <MemoizedHeader
                  onBack={goBack}
                  leftIcon={<FaArrowLeft />}
                  isIconBusinessShow={false}
                />
              </article>
              <div className="w-full h-6 -mb-6 bg-[#ffffff] md:hidden lg:hidden" />
              <div
                className={cn(
                  "absolute top-0 w-full bg-white h-[11rem] z-[-1] lg:hidden",
                  selectedGroupPage === "USERS" && "h-[11rem]",
                  selectedGroupPage === "CREATE GROUP" && "h-[8rem]",
                )}
              />
              {selectedGroupPage === "USERS" && (
                <GroupClients groupUserData={groupUserData} />
              )}
              {selectedGroupPage === "CREATE GROUP" && <CreateDynamicGroup />}
              {selectedGroupPage === "ADD TAGS" && <AddTagToGroup />}
            </section>
          </PopUp>
        )}
      </section>
      <button onClick={createGroup} type="button" className="bottom_btn">
        Create Group
      </button>
    </>
  );
};

const TargetGroups = memo(MemoTargetGroups);

export default TargetGroups;
