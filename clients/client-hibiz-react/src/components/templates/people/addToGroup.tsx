import BottomButton from "@/components/atom/bottomButton";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { IUserGroup } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { memo, useCallback } from "react";
import { IoMdArrowRoundForward } from "react-icons/io";
import { PiPersonArmsSpreadFill } from "react-icons/pi";

const MemoAddToGroup = ({
  groupData,
}: { groupData: IUserGroup[] | undefined }) => {
  const {
    setAddGroupPage,
    setSelectedGroupId,
    setSelectedGroupName,
    selectedGroupId,
    addGroupPage
  } = useHiPeopleStore(state=>({
    setAddGroupPage: state.setAddGroupPage,
    setSelectedGroupId: state.setSelectedGroupId,
    setSelectedGroupName: state.setSelectedGroupName,
    selectedGroupId: state.selectedGroupId,
    addGroupPage: state.addGroupPage,
  }));

  const handleGroupClick = useCallback(
    (groupId: string, groupName: string) => {
      if (selectedGroupId === groupId) {
        setSelectedGroupId("");
        setSelectedGroupName("");
        return;
      }
      setSelectedGroupId(groupId);
      setSelectedGroupName(groupName);
    },
    [selectedGroupId],
  );

  const createGroup = useCallback(() => {
    setAddGroupPage("CREATE GROUP");
  }, [addGroupPage]);

  return (
    <article className="flex flex-wrap justify-center items-center mx-0 md:mx-4 gap-x-4 pb-[7rem]">
      {groupData?.map((group) => {
        const isSelected = selectedGroupId === group._id;
        return (
          <button
            type="button"
            key={group._id}
            className={cn(
              "w-full p-4 mt-4 mx-4 md:mx-0 rounded-xl md:w-[22rem] lg:w-[21rem] cursor-pointer",
              isSelected ? "bg-[#6F649B] text-white" : "bg-white",
            )}
            onClick={() => handleGroupClick(group._id, group.name)}
          >
            <section className="flex justify-between">
              <h3 className="font-semibold">{group.name}</h3>
              <div
                className={cn(
                  "flex items-center justify-center gap-2",
                  isSelected ? "text-white" : "text-[#6F649B]",
                )}
              >
                <PiPersonArmsSpreadFill /> {group.userIds.length}
              </div>
            </section>
            {group?.filter?.map((filter) => (
              <section
                key={filter._id}
                className="flex flex-col py-2 space-y-2 text-sm rounded-xl"
              >
                <article
                  className={`flex items-center py-1 px-2 rounded-full ${
                    isSelected ? "bg-[#ffffff33]" : "bg-[#6F649B10]"
                  }`}
                >
                  <IoMdArrowRoundForward className="mr-2" />
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-white" : "text-[#6F649B]"
                    }`}
                  >
                    Total visits{" "}
                    {filter?.visitType === "ABOVE" ? "more than" : "less than"}{" "}
                    {filter?.visit} in {filter?.duration} days
                  </span>
                </article>
                <article
                  className={`flex items-center py-1 px-2 rounded-full ${
                    isSelected ? "bg-[#ffffff33]" : "bg-[#6F649B10]"
                  }`}
                >
                  <IoMdArrowRoundForward className="mr-2" />
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-white" : "text-[#6F649B]"
                    }`}
                  >
                    Avg spend{" "}
                    {filter?.spendType === "ABOVE" ? "more than" : "less than"} ₹
                    {filter?.spend} in total
                  </span>
                </article>
              </section>
            ))}
          </button>
        );
      })}
      <button onClick={createGroup} type="button" className="bg-[#000000] text-white text-sm px-4 py-3 rounded-full absolute right-4 bottom-16 lg:top-6 lg:bottom-auto"> 
        Create a new group
      </button>
      {selectedGroupId && (
        <BottomButton
          buttons={[
            {
              text: "Proceed",
              onClick: () => setAddGroupPage("CONFIRM"),
              type: "button",
            },
          ]}
        />
      )}
    </article>
  );
};

const AddToGroup = memo(MemoAddToGroup);

export default AddToGroup;
