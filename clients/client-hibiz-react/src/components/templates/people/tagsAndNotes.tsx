import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { TagDetails } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { useGetUserNotes, useTagsNotes } from "@/hooks/useHipeople";
import { memo, useCallback, useMemo } from "react";
import { MdDelete, MdOutlineArrowOutward } from "react-icons/md";
import { TiTick } from "react-icons/ti";

const MemoTagsAndNotes = () => {
  const {
    openTagPopup,
    setOpenTagPopup,
    setTagNotesData,
    openAddTagz,
    setOpenAddTagz,
    openAddNotes,
    setOpenAddNotes,
    setSelectedDeleteTagId,
    openDeletePopup,
    setOpenDeletePopup,
    setImageFiles,
    setImg,
    setTitleNotes,
    setDescriptionNotes,
    setTagName,
    setTagNotes,
    setDisplayToCaptain,
    setDuration,
    setTime,
    setRemainder,
    setHistory,
    setSingleTagData,
  } = useHiPeopleStore((s) => ({
    openTagPopup: s.openTagPopup,
    openAddTagz: s.openAddTagz,
    setOpenAddTagz: s.setOpenAddTagz,
    setOpenTagPopup: s.setOpenTagPopup,
    setTagNotesData: s.setTagNotesData,
    openAddNotes: s.openAddNotes,
    setOpenAddNotes: s.setOpenAddNotes,
    setSelectedDeleteTagId: s.setSelectedDeleteTagId,
    openDeletePopup: s.openDeletePopup,
    setOpenDeletePopup: s.setOpenDeletePopup,
    setImageFiles: s.setImageFiles,
    setImg: s.setImg,
    setTitleNotes: s.setTitleNotes,
    setDescriptionNotes: s.setDescriptionNotes,
    setTagName: s.setTagName,
    setTagNotes: s.setTagNotes,
    setDisplayToCaptain: s.setDisplayToCaptain,
    setDuration: s.setDuration,
    setTime: s.setTime,
    setRemainder: s.setRemainder,
    setHistory: s.setHistory,
    setSingleTagData: s.setSingleTagData,
  }));

  const { data: tags } = useTagsNotes();
  const { data: notes } = useGetUserNotes();

  const combinedItems = useMemo(() => {
    const combined = [];
    const remainingNotes = Array.isArray(notes) ? [...notes] : [];

    // Ensure tags is an array before iterating
    if (Array.isArray(tags)) {
      tags.forEach((tag, index) => {
        combined.push({ type: "tag", data: tag });
        if (index % 2 === 1 && remainingNotes.length) {
          const note = remainingNotes.shift();
          combined.push({ type: "note", data: note });
        }
      });
    }

    for (const note of remainingNotes) {
      combined.push({ type: "note", data: note });
    }

    return combined;
  }, [tags, notes]);

  const handleTagPopup = useCallback(
    (tagData: TagDetails) => {
      setOpenTagPopup(!openTagPopup);
      setTagNotesData(tagData);
    },
    [openTagPopup],
  );

  const handleAddTagz = useCallback(() => {
    setOpenAddTagz(!openAddTagz);
    setTagName("");
    setTagNotes("");
    setDisplayToCaptain(false);
    setDuration("");
    setTime("");
    setRemainder("");
    setHistory([]);
    setSingleTagData({});
  }, [openAddTagz]);

  const handleAddNotes = useCallback(() => {
    setOpenAddNotes(!openAddNotes);
    setImageFiles([]);
    setImg({});
    setTitleNotes("");
    setDescriptionNotes("");
  }, [openAddNotes]);

  const handleDelete = useCallback(
    (e, id: string) => {
      e.stopPropagation();
      setOpenDeletePopup(!openDeletePopup);
      setSelectedDeleteTagId(id);
    },
    [openDeletePopup],
  );

  return (
    <>
      <center className="mt-4 space-x-2">
        <button
          type="button"
          onClick={handleAddTagz}
          className="bg-[#8C63FF20] text-[#8C63FF] border border-1 border-[#8C63FF] rounded-xl p-2"
        >
          + Add Tagz
        </button>
        <button
          type="button"
          onClick={handleAddNotes}
          className="bg-[#5197F820] text-[#5197F8] border border-1 border-[#5197F8] rounded-xl p-2"
        >
          + Add Notes
        </button>
      </center>

      <section className="relative grid grid-cols-2 gap-3 px-4 py-6 bg-gray-100 md:grid-cols-4 lg:grid-cols-6 pb-[10rem]">
        {combinedItems.length > 0 ? (
          combinedItems.map((item) => {
            if (item.type === "tag") {
              return (
                <article
                  key={item.data.tagId._id}
                  onKeyDown={() => handleTagPopup(item.data)}
                  onClick={() => handleTagPopup(item.data)}
                  className="w-full p-3 bg-white rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-sm">
                      <span
                        style={{
                          color:
                            item?.data?.tagId.tagType === "AUTO_TAG"
                              ? "#FFA500"
                              : "#8C63FF",
                        }}
                      >
                        #{" "}
                        {item?.data?.tagId.tagType === "AUTO_TAG"
                          ? "Auto Tag"
                          : "Manual Tag"}
                      </span>
                    </h1>
                    <span
                      className={cn(
                        item?.data?.tagId.displayForCaptains
                          ? "border-[#000000]"
                          : "border-[#CACACA]",
                        "rounded-full w-fit border border-1",
                      )}
                    >
                      <TiTick
                        size={20}
                        color={cn(
                          item?.data?.tagId.displayForCaptains
                            ? "bg-[#000000]"
                            : "bg-[#CACACA]",
                        )}
                      />
                    </span>
                    <MdDelete
                      size={20}
                      color="red"
                      className="on_active_bounce"
                      onClick={(e) => handleDelete(e, item?.data?.tagId._id)}
                    />
                  </div>
                  <div className="flex space-x-2 space-y-2">
                    <div
                      style={{
                        backgroundColor:
                          item?.data?.tagId.tagType === "AUTO_TAG"
                            ? "#FFA500"
                            : "#8C63FF",
                      }}
                      className="w-6 h-6 mt-2 rounded-full"
                    />
                    <h1>{item?.data?.tagId.name}</h1>
                  </div>
                  <article className="flex items-center justify-between pt-4">
                    {item?.data?.count ? (
                      <h1 className="text-2xl">
                        <span className="text-xs">x </span>
                        {item?.data?.count}
                      </h1>
                    ) : null}
                    <MdOutlineArrowOutward
                      size={25}
                      color={
                        item?.data?.tagId.tagType === "AUTO_TAG"
                          ? "#FFA500"
                          : "#8C63FF"
                      }
                    />
                  </article>
                </article>
              );
            }
            if (item.type === "note" && item.data) {
              return (
                <section
                  key={item.data._id}
                  className="bg-white col-span-full md:col-span-2 rounded-2xl"
                >
                  <h1 className="text-sm text-[#5197F8] px-4 pt-2 pb-2 w-12 rounded-full">
                    Note
                  </h1>
                  <article className="flex px-4 pt-0 pb-4 space-x-4">
                    <img
                      src={item.data.noteUrl}
                      loading="lazy"
                      alt="note"
                      className="w-[75px] h-[75px] md:w-[100px] md:h-[100px] object-contain"
                    />
                    <div className="flex-1">
                      <h1 className="text-base font-semibold line-clamp-1 md:line-clamp-2">
                        {item.data.noteTitle}
                      </h1>
                      <p className="text-sm line-clamp-3">
                        {item.data.noteDescription}
                      </p>
                    </div>
                  </article>
                </section>
              );
            }
            return null;
          })
        ) : (
          <div className="absolute text-2xl text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            No Tags Found
          </div>
        )}
      </section>
    </>
  );
};

const TagsAndNotes = memo(MemoTagsAndNotes);
export default TagsAndNotes;
