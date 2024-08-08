import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useRemoveTag } from "@/hooks/useHipeople";
import { memo, useCallback } from "react";
import { AiFillAlert } from "react-icons/ai";

const MemoRemoveTag = () => {
  const { mutate } = useRemoveTag();
  const {
    setSelectedDeleteTagId,
    selectedDeleteTagId,
    setOpenDeletePopup,
    openDeletePopup,
  } = useHiPeopleStore((s) => ({
    setSelectedDeleteTagId: s.setSelectedDeleteTagId,
    setOpenDeletePopup: s.setOpenDeletePopup,
    selectedDeleteTagId: s.selectedDeleteTagId,
    openDeletePopup: s.openDeletePopup,
  }));

  const handleDeleteTag = async () => {
    await mutate();
    setOpenDeletePopup(false);
  };

  const handleCancel = useCallback(() => {
    setSelectedDeleteTagId("");
    setOpenDeletePopup(false);
  }, [selectedDeleteTagId, openDeletePopup]);

  return (
    <div className="flex justify-center my-6">
      <section className="h-[20rem] w-[20rem] border-1 border rounded-2xl p-6">
        <AiFillAlert color="red" size="28" />
        <h1 className="mt-2 mb-6 text-2xl font-bold">Delete Tag!</h1>
        <p className="text-sm text-[#CACACA] mb-4">
          This action cannot be undone.
        </p>
        <p className="text-xl">Do you want to cancel the Delete?</p>
        <center className="mt-10 space-x-24">
          <button
            type="button"
            className="px-4 py-2 mr-2 bg-gray-300 rounded-full on_active_bounce"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-white bg-red-600 rounded-full on_active_bounce"
            onClick={handleDeleteTag}
          >
            Delete
          </button>
        </center>
      </section>
    </div>
  );
};

const RemoveTag = memo(MemoRemoveTag);
export default RemoveTag;
