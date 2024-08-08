import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type {
  ICustomerRecord,
  IUserGroup,
} from "@/components/types/businessData";
import { hexToRgba } from "@/components/utils/helper";
import {
  useAllUserBelongToGroup,
  useGetGroupData,
} from "@/hooks/usePeopleData";
import { memo, useCallback, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FaMoneyBills } from "react-icons/fa6";
import { LuSettings } from "react-icons/lu";
import { MdPersonOutline, MdRebaseEdit } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { VscGraph } from "react-icons/vsc";

const topNavigationArr = [
  {
    icon: LuSettings,
    name: "Settings",
  },
  {
    icon: VscGraph,
    name: "Analytics",
  },
  {
    icon: MdRebaseEdit,
    name: "Action",
  },
];

const MemoTargetGroups = () => {
  const { groupData, groupLoading } = useGetGroupData(true);
  const {
    groupDetailsModal,
    setGroupDetailsModal,
    selectedGroup,
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
            backgroundColor: hexToRgba(group.groupColor),
          }}
          key={group._id}
          className="w-full gap-4 p-4 mt-4 text-left rounded-2xl"
        >
          <div
            style={{
              backgroundColor: group.groupColor,
            }}
            className="w-4 h-4 mb-1 ml-[0.1rem] rounded-full"
          />
          <div className="flex items-center gap-1">
            <MdPersonOutline size={20} />
            {group.userIds.length > 0 && <span>{group.userIds.length}</span>}
          </div>
          <h3 className="mt-1 leading-5">{group.name}</h3>
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
            <h3 className="ml-6 text-3xl relative z-10 text-[#6F649B] capitalize">
              {selectedGroup.name}
            </h3>

            <section className="bg-[#E3DCFF] rounded-3xl px-4 py-3 justify-evenly mx-6 mt-4 flex items-center relative z-10">
              {topNavigationArr.map((item) => (
                <article key={item.name}>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-4 bg-black text-white rounded-full max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
                  >
                    <item.icon />
                  </button>
                    <h3 className="text-sm">{item.name}</h3>
                </article>
              ))}
            </section>

            <section className="flex flex-wrap justify-start mt-6 pb-[7rem] gap-4 mx-4 lg:pb-[5rem]">
              {groupUserData.map((user: ICustomerRecord) => (
                <button
                  key={user._id}
                  type="button"
                  className="relative w-full p-4 bg-white rounded-2xl max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
                >
                  <article className="flex items-center justify-between">
                    <h3>{user.userId.name}</h3>
                    <p>
                      {user.userId.phone.slice(0, 2)}******
                      {user.userId.phone.slice(-2)}
                    </p>
                  </article>
                  <div className="flex items-center justify-between gap-2 text-[#6F649B]">
                    <div className="flex items-center gap-1">
                      <SlLocationPin />
                      {user.visitCount} visits
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMoneyBills />
                      {user.avgSpend}
                    </div>
                  </div>
                </button>
              ))}
            </section>
            <BottomButton
              buttons={[
                {
                  text: "Close",
                  onClick: () => setGroupDetailsModal(false),
                },
              ]}
            />
          </section>
        </PopUp>
      )}
    </section>
  );
};

const TargetGroups = memo(MemoTargetGroups);

export default TargetGroups;
