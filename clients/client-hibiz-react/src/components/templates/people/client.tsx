import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useGetGroupData } from "@/hooks/usePeopleData";
import { memo, useCallback, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import AddToGroup from "./addToGroup";
import Confirm from "./confirm";
import CreateGroup from "./createGroup";
import UsersList from "./usersList";

const MemoClient = () => {
  const {
    selectedUserIds,
    addGroupModal,
    setAddGroupModal,
    setAddGroupPage,
    addGroupPage,
    reset,
  } = useHiPeopleStore((state) => ({
    selectedUserIds: state.selectedUserIds,
    addGroupModal: state.addGroupModal,
    setAddGroupModal: state.setAddGroupModal,
    setAddGroupPage: state.setAddGroupPage,
    addGroupPage: state.addGroupPage,
    reset: state.reset,
  }));
  const [fetchGroupData, setFetchGroupData] = useState<boolean>(false);
  const { groupData, groupLoading } = useGetGroupData(fetchGroupData);

  const openGroup = useCallback(() => {
    setAddGroupModal(true);
    setFetchGroupData(true);
    setAddGroupPage("ADD TO GROUP");
  }, []);

  const closeGroupModel = useCallback(() => {
    setAddGroupModal(false);
    setFetchGroupData(false);
    reset();
  }, []);

  const onBack = useCallback(() => {
    switch (addGroupPage) {
      case "ADD TO GROUP":
        closeGroupModel();
        break;
      case "CONFIRM":
        setAddGroupPage("ADD TO GROUP");
        break;
      case "CREATE GROUP":
        setAddGroupPage("ADD TO GROUP");
        break;
      case "ADD MORE USERS":
        setAddGroupPage("CREATE GROUP");
        break;
      default:
        break;
    }
  }, [addGroupPage, addGroupModal]);

  const dynamicHeader = useCallback(() => {
    switch (addGroupPage) {
      case "ADD TO GROUP":
        return "Add to group";
      case "CONFIRM":
        return "Confirm";
      case "CREATE GROUP":
        return "Create manual group";
      default:
        return "Add to group";
    }
  }, [addGroupPage, addGroupModal]);

  if (groupLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-4">
      <UsersList />
      {addGroupModal && (
        <PopUp show={addGroupModal} onClose={closeGroupModel}>
          <section className="h-[85dvh] overflow-auto">
            <article className="sticky top-0 bg-[#f4f4f4] rounded-t-2xl">
              <MemoizedHeader
                title={dynamicHeader()}
                onBack={onBack}
                leftIcon={<FaArrowLeft />}
                centerImage={Hi}
                rightImage={Hi}
                isIconBusinessShow={false}
                hideBack={addGroupPage === "ADD MORE USERS"}
              />
            </article>

            {addGroupPage === "ADD TO GROUP" && (
              <AddToGroup groupData={groupData} />
            )}

            {addGroupPage === "CREATE GROUP" && <CreateGroup />}

            {addGroupPage === "ADD MORE USERS" && <UsersList hide />}

            {addGroupPage === "CONFIRM" && <Confirm />}
          </section>
        </PopUp>
      )}

      {selectedUserIds.length > 0 && (
        <button onClick={openGroup} type="button" className="bottom_btn">
          Add users to group
        </button>
      )}
    </div>
  );
};

const Client = memo(MemoClient);
export default Client;
