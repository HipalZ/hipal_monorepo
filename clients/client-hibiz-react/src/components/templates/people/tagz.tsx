import { memo, useState, useMemo, lazy, useCallback } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { useAllTags } from "@/hooks/useHipeople";
import { MdDeleteOutline } from "react-icons/md";
import RemoveTag from "./removeTag";
import { cn } from "@/components/utils/helper";
import { TiStarburstOutline } from "react-icons/ti";
import Fuse from "fuse.js";
import EditTagz from "./editTagz";
const CreateTag = lazy(() => import("./createTagz"));
const PopUp = lazy(() => import("@/components/atom/popUp"));

const MemoTagz = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    openCreateTagPopup,
    setOpenCreateTagPopup,
    openDeletePopup,
    setOpenDeletePopup,
    setSelectedDeleteTagId,
    selectedDeleteTagId,
    setSingleTagData,
    openEditTagPopup,
    time,
    duration,
    remainder,
    tagNotes,
    setOpenEditTagPopup,
    setDisplayToCaptain,
    setDuration,
    setRemainder,
    setTime,
    setTagNotes,
    setTagName,
    setHistory,
  } = useHiPeopleStore((s) => ({
    setTagName: s.setTagName,
    setHistory: s.setHistory,
    openCreateTagPopup: s.openCreateTagPopup,
    setOpenCreateTagPopup: s.setOpenCreateTagPopup,
    openDeletePopup: s.openDeletePopup,
    setOpenDeletePopup: s.setOpenDeletePopup,
    setSelectedDeleteTagId: s.setSelectedDeleteTagId,
    selectedDeleteTagId: s.selectedDeleteTagId,
    setSingleTagData: s.setSingleTagData,
    openEditTagPopup: s.openEditTagPopup,
    time: s.time,
    duration: s.duration,
    remainder: s.remainder,
    tagNotes: s.tagNotes,
    setOpenEditTagPopup: s.setOpenEditTagPopup,
    setDuration: s.setDuration,
    setRemainder: s.setRemainder,
    setTime: s.setTime,
    setDisplayToCaptain: s.setDisplayToCaptain,
    setTagNotes: s.setTagNotes,
  }));

  const { data: tagData } = useAllTags();

  // Fuse.js setup
  const fuse = new Fuse(tagData || [], {
    keys: ["name"],
    threshold: 0.3,
  });

  const filteredTags = useMemo(() => {
    if (!searchQuery) {
      return tagData;
    }
    const result = fuse.search(searchQuery);
    return result.map(({ item }) => item);
  }, [searchQuery, tagData]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery("");
  }, [searchQuery, isSearchOpen]);

  const handleSearchChange = useCallback(
    (e) => {
      setSearchQuery(e.target.value);
    },
    [searchQuery],
  );

  const handleCloseDelete = useCallback(() => {
    setOpenDeletePopup(false);
  }, [openDeletePopup]);

  const handleDelete = useCallback(
    (e, id) => {
      e.stopPropagation();
      setOpenDeletePopup(!openDeletePopup);
      setSelectedDeleteTagId(id);
    },
    [openDeletePopup, selectedDeleteTagId],
  );

  const handleEditTag = useCallback(
    (tag: any) => {
      setSingleTagData(tag);
      setOpenEditTagPopup(true);
    },
    [openEditTagPopup],
  );

  const handleClose = useCallback(() => {
    setOpenEditTagPopup(!openEditTagPopup);
    setTagNotes("");
    setRemainder("");
    setDuration("");
    setTime("");
    setDisplayToCaptain(false);
  }, [openEditTagPopup, tagNotes, remainder, duration, time]);

  const handleCreateTagz = useCallback(() => {
    setOpenCreateTagPopup(!openCreateTagPopup);
    setTagName("");
    setTagNotes("");
    setDisplayToCaptain(false);
    setDuration("");
    setTime("");
    setRemainder("");
    setHistory([]);
    setSingleTagData({});
  }, [openCreateTagPopup]);

  return (
    <main>
      <section className="relative m-4 min-h-[65dvh] ">
        <article className="flex items-center justify-between">
          <h1 className="text-[#6F649B] w-[5rem] md:w-full">All tagz</h1>
          {isSearchOpen ? (
            <div className="flex items-center">
              <input
                type="text"
                className="w-full p-1 pl-3 border border-black rounded-2xl"
                placeholder="Search Tagz..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="button" onClick={toggleSearch} className="ml-2">
                <FaTimes className="text-[#6F649B]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleSearch}
              className="p-2 bg-black rounded-full"
            >
              <FaSearch className="text-white" />
            </button>
          )}
        </article>
        <section className="relative grid grid-cols-3 gap-2 py-6 bg-gray-100 md:grid-cols-5 lg:grid-cols-6 pb-[10rem]">
          {filteredTags && filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <article
                key={tag?._id}
                onClick={() => handleEditTag(tag)}
                onKeyDown={() => handleEditTag(tag)}
                className="border border-1 border-[#6F649B] rounded-2xl p-2 space-y-4 bg-white"
              >
                <section className="flex items-center justify-between ">
                  <h1 className="text-[#6F649B] text-xl font-semibold">#</h1>
                  <article className="flex space-x-2">
                    <span
                      className={cn(
                        "p-1 rounded-full cursor-pointer",
                        tag?.displayForCaptains
                          ? "bg-[#52B76320]"
                          : "bg-[#6F649B20]",
                      )}
                    >
                      <TiStarburstOutline
                        color={cn(
                          tag?.displayForCaptains ? "#52B763" : "#6F649B",
                        )}
                      />
                    </span>
                    <span
                      className="p-1 bg-red-100 rounded-full cursor-pointer"
                      onClick={(e) => handleDelete(e, tag?._id)}
                      onKeyDown={(e) => handleDelete(e, tag?._id)}
                    >
                      <MdDeleteOutline color="red" />
                    </span>
                  </article>
                </section>
                <p title={tag?.name} className="text-[#6F649B] cursor-pointer">
                  {tag?.name}
                </p>
              </article>
            ))
          ) : (
            <p className="text-gray-500">No tags found.</p>
          )}
        </section>
      </section>
      <button
        onClick={handleCreateTagz}
        className="z-50 flex items-center float-right h-10 px-4 py-2 mr-6 text-white bg-black rounded-full cursor-pointer"
        type="button"
      >
        <span>Create Tagz</span>
      </button>
      {openCreateTagPopup ? (
        <PopUp show={openCreateTagPopup} onClose={handleCreateTagz}>
          <CreateTag />
        </PopUp>
      ) : null}
      {openDeletePopup ? (
        <PopUp show={openDeletePopup} onClose={handleCloseDelete}>
          <RemoveTag />
        </PopUp>
      ) : null}
      {openEditTagPopup ? (
        <PopUp show={openEditTagPopup} onClose={handleClose}>
          <EditTagz />
        </PopUp>
      ) : null}
    </main>
  );
};

const Tagz = memo(MemoTagz);
export default Tagz;
