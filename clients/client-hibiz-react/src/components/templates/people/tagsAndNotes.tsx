import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { cn } from "@/components/utils/helper";
import { useTagsNotes } from "@/hooks/useHipeople";
import { memo } from "react";
import { MdDelete, MdOutlineArrowOutward } from "react-icons/md";
import { TiTick } from "react-icons/ti";

const MemoTagsAndNotes = () => {
  const {
    openTagPopup,
    setOpenTagPopup,
    setSingleTagData,
    openAddTagz,
    setOpenAddTagz,
    openAddNotes,
    setOpenAddNotes,
    setSelectedDeleteTagId,
    openDeletePopup,
    setOpenDeletePopup,
  } = useHiPeopleStore((s) => ({
    openTagPopup: s.openTagPopup,
    openAddTagz: s.openAddTagz,
    setOpenAddTagz: s.setOpenAddTagz,
    setOpenTagPopup: s.setOpenTagPopup,
    setSingleTagData: s.setSingleTagData,
    openAddNotes: s.openAddNotes,
    setOpenAddNotes: s.setOpenAddNotes,
    setSelectedDeleteTagId: s.setSelectedDeleteTagId,
    openDeletePopup: s.openDeletePopup,
    setOpenDeletePopup: s.setOpenDeletePopup,
  }));

  const { data: tags } = useTagsNotes();

  const handleTagPopup = (tagData) => {
    setOpenTagPopup(!openTagPopup);
    setSingleTagData(tagData);
  };

  const handleAddTagz = () => {
    setOpenAddTagz(!openAddTagz);
  };

  const handleAddNotes = () => {
    setOpenAddNotes(!openAddNotes);
  };

  const handleDelete = (e, id: string) => {
    e.stopPropagation();
    setOpenDeletePopup(!openDeletePopup);
    setSelectedDeleteTagId(id);
  };

  return (
    <>
      <center className="space-x-2">
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
          className="bg-[#8C63FF20] text-[#8C63FF] border border-1 border-[#8C63FF] rounded-xl p-2"
        >
          + Add Notes
        </button>
      </center>
      <section className="relative grid grid-cols-2 gap-3 px-4 py-6 bg-gray-100 md:grid-cols-4 lg:grid-cols-6 place-items-center pb-[10rem]">
        {tags && tags?.length > 0 ? (
          tags?.map((tag) => {
            return (
              <article
                key={tag?.tagId?._id}
                onKeyDown={() => handleTagPopup(tag)}
                onClick={() => handleTagPopup(tag)}
                className="w-full p-3 bg-white rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-sm">
                    <span
                      style={{
                        color:
                          tag?.tagId?.tagType === "AUTO_TAG"
                            ? "#FFA500"
                            : "#8C63FF",
                      }}
                    >
                      #{" "}
                      {tag?.tagId?.tagType === "AUTO_TAG"
                        ? "Auto Tag"
                        : "Manual Tag"}
                    </span>
                  </h1>
                  <span
                    className={cn(
                      tag?.tagId?.displayForCaptains
                        ? "border-[#000000]"
                        : "border-[#CACACA]",
                      "rounded-full w-fit border border-1",
                    )}
                  >
                    <TiTick
                      size={20}
                      color={cn(
                        tag?.tagId?.displayForCaptains
                          ? "bg-[#000000]"
                          : "bg-[#CACACA]",
                      )}
                    />
                  </span>
                  <MdDelete
                    size={20}
                    color="red"
                    className="on_active_bounce"
                    onClick={(e) => handleDelete(e, tag?.tagId?._id)}
                  />
                </div>
                <div className="flex space-x-2 space-y-2">
                  <div
                    style={{
                      backgroundColor:
                        tag?.tagId?.tagType === "AUTO_TAG"
                          ? "#FFA500"
                          : "#8C63FF",
                    }}
                    className="w-6 h-6 mt-2 rounded-full"
                  />
                  <h1>{tag?.tagId?.name}</h1>
                </div>
                <article className="flex items-center justify-between pt-4">
                  {tag?.count ? (
                    <h1 className="text-2xl">
                      <span className="text-xs">x </span>
                      {tag?.count}
                    </h1>
                  ) : null}
                  <MdOutlineArrowOutward
                    size={25}
                    color={tag?.tagType === "AUTO_TAG" ? "#FFA500" : "#8C63FF"}
                  />
                </article>
              </article>
            );
          })
        ) : (
          <div className="absolute text-2xl text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
            No Data Found
          </div>
        )}
      </section>
    </>
  );
};

const TagsAndNotes = memo(MemoTagsAndNotes);
export default TagsAndNotes;
