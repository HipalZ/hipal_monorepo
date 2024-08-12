import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useDeleteNotes } from "@/hooks/useHipeople";
import { memo, useCallback } from "react";
import { AiFillAlert } from "react-icons/ai";

const MemoDeleteNote = () => {
  const { mutate } = useDeleteNotes();
  const {
    setSelectedDeleteTagId,
    selectedDeleteTagId,
    setOpenDeleteNotePopup,
    openDeleteNotePopup,
  } = useHiPeopleStore((s) => ({
    setSelectedDeleteTagId: s.setSelectedDeleteTagId,
    setOpenDeleteNotePopup: s.setOpenDeleteNotePopup,
    selectedDeleteTagId: s.selectedDeleteTagId,
    openDeleteNotePopup: s.openDeleteNotePopup,
  }));

  const handleDeleteNote = async () => {
    await mutate();
    setOpenDeleteNotePopup(false);
  };

  const handleCancel = useCallback(() => {
    setSelectedDeleteTagId("");
    setOpenDeleteNotePopup(false);
  }, [selectedDeleteTagId, openDeleteNotePopup]);

  return (
    <div className="flex justify-center my-6">
      <section className="h-[20rem] w-[20rem] border-1 border rounded-2xl p-6">
        <AiFillAlert color="red" size="28" />
        <h1 className="mt-2 mb-6 text-2xl font-bold">Delete Note!</h1>
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
            onClick={handleDeleteNote}
          >
            Delete
          </button>
        </center>
      </section>
    </div>
  );
};

const DeleteNote = memo(MemoDeleteNote);
export default DeleteNote;
