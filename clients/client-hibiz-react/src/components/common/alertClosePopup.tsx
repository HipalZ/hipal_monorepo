import { memo, useCallback } from "react";
import useMenuPageStore from "../store/useMenuStorage";
import { GoAlertFill } from "react-icons/go";

const MemoAlertClosePopup = () => {
  const {
    setEditOpenMenu,
    resetStore,
    editOpenMenu,
    setSelectedPage,
    tempPage,
    setOpenMenu,
    openMenu,
  } = useMenuPageStore((s) => ({
    setEditOpenMenu: s.setEditOpenMenu,
    resetStore: s.resetStore,
    editOpenMenu: s.editOpenMenu,
    setTempPage: s.setTempPage,
    setSelectedPage: s.setSelectedPage,
    tempPage: s.tempPage,
    setOpenMenu: s.setOpenMenu,
    openMenu: s.openMenu,
  }));

  const resetData = useCallback(() => {
    setEditOpenMenu(false);
    setOpenMenu(false);
    resetStore();
    setSelectedPage(tempPage);
  }, [editOpenMenu, openMenu]);

  return (
    <>
      <center className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <GoAlertFill size={40} />
        <h1 className="text-2xl">You have unsaved changes</h1>
        <p className="mb-4 text-sm text-black opacity-75">
          This action cannot be undone.
        </p>
        <div className="space-x-4">
          <button
            className="px-4 py-2 mr-2 text-sm bg-gray-300 rounded-full"
            type="button"
            onClick={() => setSelectedPage(tempPage)}
          >
            Back to Edit
          </button>
          <button
            onClick={resetData}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-full"
            type="button"
          >
            Exit without save
          </button>
        </div>
      </center>
    </>
  );
};

const AlertClosePopup = memo(MemoAlertClosePopup);
export default AlertClosePopup;
