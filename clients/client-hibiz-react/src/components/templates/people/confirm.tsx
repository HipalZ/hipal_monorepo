import BottomButton from "@/components/atom/bottomButton";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useAddUserToGroup } from "@/hooks/usePeopleData";

const Confirm = () => {
  const { selectedUserIds, selectedGroupName, setAddGroupPage,selectedGroupId } =
    useHiPeopleStore((s) => ({
      selectedUserIds: s.selectedUserIds,
      selectedGroupName: s.selectedGroupName,
      setAddGroupPage: s.setAddGroupPage,
      selectedGroupId: s.selectedGroupId,
    }));

  const { mutateAddUserToGroup, isAddingUserPending } = useAddUserToGroup();

  const saveUserToGroup = () => {
    mutateAddUserToGroup({
      groupId: selectedGroupId,
      userIds: selectedUserIds,
    });
  };

  if (isAddingUserPending) {
    return <LoadingSpinner />;
  }

  return (
    <center className="">
      <article className="w-[88%] mt-[10vh] text-left bg-white p-6 h-[35vh] mx-6 rounded-2xl max-w-[28rem]">
        <h1 className="text-2xl">🌟</h1>
        <h3 className="mt-4 text-2xl font-semibold">Are you sure?</h3>
        <h5 className="mt-4">
          Do yoy want the selected{" "}
          <span className="text-[#8C63FF] font-semibold">
            {selectedUserIds.length} users
          </span>{" "}
          to be added to{" "}
          <span className="text-[#8C63FF] font-semibold capitalize">
            “{selectedGroupName}”
          </span>{" "}
          Group
        </h5>
      </article>
      <BottomButton
        buttons={[
          {
            text: "Cancel",
            onClick: () => setAddGroupPage("ADD TO GROUP"),
            type: "button",
            delete: true,
          },
          {
            text: "Confirm",
            onClick: saveUserToGroup,
            type: "button",
          },
        ]}
      />
    </center>
  );
};

export default Confirm;
