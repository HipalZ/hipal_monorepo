import useHiPeopleStore from "@/components/store/useHipeopleStore";
import { memo } from "react";
import { MdOutlineArrowOutward } from "react-icons/md";
import { TiTick } from "react-icons/ti";

const arrayOfTags = [
  {
    id: "1",
    tagName: "Manual Tag",
    color: "#8C63FF",
    text: "Zomato Pay",
    count: 2,
  },
  {
    id: "2",
    tagName: "Manual Tag",
    color: "#8C63FF",
    text: "Zomato Delivery",
    count: 5,
  },
  {
    id: "3",
    tagName: "Manual Tag",
    color: "#FFA500",
    text: "Zomato Delivery",
    count: 5,
  },
];

const MemoTagsAndNotes = () => {
  const { openTagPopup, setOpenTagPopup, setSingleTagData } = useHiPeopleStore(
    (s) => ({
      openTagPopup: s.openTagPopup,
      setOpenTagPopup: s.setOpenTagPopup,
      setSingleTagData: s.setSingleTagData,
    }),
  );

  const handleTagPopup = (tagData) => {
    setOpenTagPopup(!openTagPopup);
    setSingleTagData(tagData);
  };

  return (
    <section className="grid grid-cols-2 gap-3 px-4 py-6 bg-gray-100 md:grid-cols-4 lg:grid-cols-6 place-items-center">
      {arrayOfTags.map((tag) => {
        return (
          <article
            key={tag?.id}
            onClick={() => handleTagPopup(tag)}
            className="p-3 h-[8rem] w-full bg-white rounded-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-sm">
                <span style={{ color: tag?.color }}># {tag?.tagName}</span>
              </h1>
              <span className="border border-1 border-[#000] rounded-full w-fit">
                <TiTick size={20} />
              </span>
            </div>
            <div className="flex space-x-2 space-y-2">
              <div
                style={{ backgroundColor: tag?.color }}
                className="w-6 h-6 mt-2 rounded-full"
              />
              <h1>Zomato Pay</h1>
            </div>
            <article className="flex items-center justify-between pt-4">
              <h1 className="text-2xl">
                <span className="text-xs">x </span>
                {tag?.count}
              </h1>
              <MdOutlineArrowOutward size={25} color={tag?.color} />
            </article>
          </article>
        );
      })}
    </section>
  );
};

const TagsAndNotes = memo(MemoTagsAndNotes);
export default TagsAndNotes;
