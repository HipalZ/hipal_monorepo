import { memo, useMemo, useState } from "react";
import newTag from "@/assets/dishTypes/new.png";
import bestseller from "@/assets/dishTypes/bestseller.png";
import spicy from "@/assets/dishTypes/spicy.png";
import popular from "@/assets/dishTypes/popular.png";
import occasional from "@/assets/dishTypes/occasional.png";
import { cn } from "@hi/common";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import { RxCross2 } from "react-icons/rx";
import { TagsEnum } from "@/components/utils/helper";
import BottomButton from "@/components/atom/bottomButton";

const tagImageMap = {
  New: newTag,
  Best_seller: bestseller,
  Spicy: spicy,
  Occasional: occasional,
  Popular: popular,
};

const MemoLinkTags = () => {
  const { setTags, tags, setDishStep } = useMenuPageStore((s) => ({
    tags: s.tags,
    setTags: s.setTags,
    setDishStep: s.setDishStep,
  }));
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const { selectedTag, customTags } = useMemo(() => {
    const predefinedTags = Object.keys(tagImageMap);
    const selectedTag = tags.filter((tag) => predefinedTags.includes(tag));
    const customTags = tags.filter((tag) => !predefinedTags.includes(tag));
    return { selectedTag, customTags };
  }, [tags]);

  const [selectedTagState, setSelectedTagState] = useState(selectedTag);
  const [customTagsState, setCustomTagsState] = useState(customTags);

  const toggleSelection = (tag: string) => {
    setSelectedTagState((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleAdd = () => {
    setIsAdding(!isAdding);
  };

  const handleSaveCustomTag = () => {
    if (newTag) {
      setCustomTagsState((prev) => [...prev, newTag]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTagsState((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    setTags([...selectedTagState, ...customTagsState]);
    setDishStep(DishSteps.DISH_STEP_2);
  };

  return (
    <section className="mx-6 lg:mx-16 lg:mt-6">
      <h1 className="mb-4 text-base text-gray-500">Recommended tags</h1>
      <section className="flex flex-row flex-wrap">
        <section className="flex flex-wrap gap-2 mt-2">
          {TagsEnum?.map((tag) => {
            const imageSrc = tagImageMap[tag];
            const isSelected = selectedTagState.includes(tag);
            return (
              <article
                onClick={() => toggleSelection(tag)}
                key={tag}
                className={cn(
                  "capitalize flex justify-between items-center px-4 py-2 rounded-full gap-1 border border-[#CACACA] cursor-pointer",
                  `${isSelected ? "bg-blue-200" : ""}`,
                )}
              >
                <img src={imageSrc} loading="lazy" alt={imageSrc} />
                <p>{tag.toLowerCase().replace(/_/g, " ")}</p>
              </article>
            );
          })}
        </section>
        <article className="flex items-center justify-between w-full my-4">
          <h1 className="text-gray-500">Custom Tags</h1>
          <button
            onClick={handleAdd}
            className="px-5 py-1 text-white bg-black rounded-full"
            type="button"
          >
            {isAdding ? "Close" : "Add"}
          </button>
        </article>
      </section>
      {isAdding && (
        <div className="flex space-x-1 lg:space-x-4">
          <div className="relative">
            <input
              type="text"
              value={newTag}
              maxLength={10}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter custom tag"
              className="bg-white rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
            <small className="absolute bottom-2 right-2">
              {newTag?.toString()?.length}/{10}
            </small>
          </div>
          <button
            className="px-5 py-1 text-white bg-black rounded-full"
            type="button"
            onClick={handleSaveCustomTag}
          >
            Save
          </button>
        </div>
      )}
      <section className="flex gap-2">
        {customTagsState.map((tag) => (
          <div key={tag} className="flex my-4 cursor-pointer">
            <span className="px-4 py-2 border rounded-full">{tag}</span>
            <button
              className="w-4 h-4 px-0.5 -ml-2 text-xs text-white bg-black rounded-full"
              type="button"
              onClick={() => removeCustomTag(tag)}
            >
              <RxCross2 />
            </button>
          </div>
        ))}
      </section>
      <button type="button" onClick={handleSave} className="bottom_btn">
        Save
      </button>
    </section>
  );
};

const LinkTags = memo(MemoLinkTags);
export default LinkTags;
