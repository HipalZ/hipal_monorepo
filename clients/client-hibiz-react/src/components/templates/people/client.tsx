import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import MemoizedHeader from "@/components/molecules/header";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useGetGroupData } from "@/hooks/usePeopleData";
import { memo, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import AddToGroup from "./addToGroup";
import Confirm from "./confirm";
import CreateGroup from "./createGroup";
import UsersList from "./usersList";

const MemoClient = () => {
  const addGroupModal = useHiPeopleStore((state) => state.addGroupModal);
  const addGroupPage = useHiPeopleStore((state) => state.addGroupPage);
  const setAddGroupModal = useHiPeopleStore((state) => state.setAddGroupModal);
  const setAddGroupPage = useHiPeopleStore((state) => state.setAddGroupPage);
  const reset = useHiPeopleStore((state) => state.reset);
  const fetchGroupData = useHiPeopleStore((state) => state.fetchGroupData);
  const setFetchGroupData = useHiPeopleStore(
    (state) => state.setFetchGroupData,
  );
  const { groupData, groupLoading } = useGetGroupData(fetchGroupData);

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
  }, [addGroupPage, closeGroupModel, setAddGroupPage]);

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
  }, [addGroupPage]);

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
    </div>
  );
};

const Client = memo(MemoClient);
export default Client;
