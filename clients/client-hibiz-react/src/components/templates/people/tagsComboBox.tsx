import useHiPeopleStore from "@/components/store/useHipeopleStore";
import type { UserTags } from "@/components/types/businessData";
import { cn } from "@/components/utils/helper";
import { useTagsNotes } from "@/hooks/useHipeople";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";

const MemoTagsComboBox = () => {
  const [query, setQuery] = useState("");
  const [tempSelected, setTempSelected] = useState<UserTags[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const {
    appliedTags,
    setAppliedTags,
    tags,
    singleBillData,
    removeTagIds,
    setRemoveTagIds,
  } = useHiPeopleStore((s) => ({
    appliedTags: s.appliedUserTags,
    setAppliedTags: s.setAppliedUserTags,
    tags: s.tags,
    singleBillData: s.singleBillData,
    removeTagIds: s.removeTagIds,
    setRemoveTagIds: s.setRemoveTagIds,
  }));

  const { data: tagsData } = useTagsNotes();

  useEffect(() => {
    setAppliedTags(singleBillData?.tagIds || []);
  }, []);

  const handleAdd = () => {
    if (tempSelected.length > 0) {
      const newTags = tempSelected.filter(
        (selectedTag) =>
          !appliedTags.some((tag) => tag._id === selectedTag._id),
      );
      const uniqueTags = [...appliedTags, ...newTags].reduce((acc, tag) => {
        if (!acc.some((existingTag) => existingTag._id === tag._id)) {
          acc.push(tag);
        }
        return acc;
      }, []);

      // Extract IDs of tags that are already present
      const existingTagIds = appliedTags.map((tag) => tag._id);

      // Filter out these IDs from tempSelected
      const filteredTempSelected = tempSelected.filter(
        (tag) => !existingTagIds.includes(tag._id),
      );

      // Update setRemoveTagIds method
      setRemoveTagIds((prevIds) => [
        ...prevIds,
        ...filteredTempSelected.map((tag) => tag._id),
      ]);

      setAppliedTags(uniqueTags);
      setTempSelected([]);
    }
  };

  const handleRemoveTag = useCallback(
    (tagToRemove: UserTags) => {
      if (singleBillData?.tagIds) {
        setRemoveTagIds((prevIds) => {
          if (prevIds.includes(tagToRemove._id)) {
            return prevIds.filter((id) => id !== tagToRemove._id);
          }
          return [...prevIds, tagToRemove._id];
        });
      }
      setAppliedTags(appliedTags.filter((tag) => tag._id !== tagToRemove._id));
    },
    [appliedTags],
  );

  const toggleSelectTagData = useCallback(
    (tagData: UserTags) => {
      if (!tagData || !tagData._id) return;

      setTempSelected((prevSelected) => {
        const isSelected = prevSelected.some((p) => p._id === tagData._id);

        if (isSelected) {
          return prevSelected.filter((p) => p._id !== tagData._id);
        }
        return [...prevSelected, tagData];
      });
      setIsOpen(false);
    },
    [tempSelected],
  );

  const filteredTags = useMemo(() => {
    if (query === "") {
      return tagsData || [];
    }
    return (tags || []).filter((tagData) => {
      return tagData?.tagId?.name?.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, tagsData, tags]);

  return (
    <>
      <section className="flex items-center justify-between w-full space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-auto">
          <Combobox
            value={[...appliedTags, ...tempSelected]}
            onChange={(value) => toggleSelectTagData(value)}
            onClose={() => setQuery("")}
            multiple
          >
            <div className="relative">
              <ComboboxInput
                className={cn(
                  "w-full rounded-lg border-[#8C63FF] py-1.5 pr-8 pl-3 text-sm",
                  "h-10 pl-2 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                )}
                displayValue={() =>
                  [...appliedTags, ...tempSelected]
                    .map((tagData) => tagData?.name)
                    .join(", ")
                }
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                placeholder="Search..."
              />
              <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                <FaChevronDown className="size-4" />
              </ComboboxButton>
            </div>

            {isOpen && (
              <ComboboxOptions
                transition
                className={cn(
                  "md:w-64 absolute z-10 mt-1 bg-white rounded-xl shadow-lg border border-gray-300 p-1",
                  "transition duration-100 ease-in-out",
                )}
              >
                {filteredTags.length > 0 ? (
                  filteredTags.map((tagData) => {
                    const isChecked = [...appliedTags, ...tempSelected].some(
                      (p) => p._id === tagData?.tagId?._id,
                    );
                    return (
                      <ComboboxOption
                        key={tagData?.tagId?._id}
                        value={tagData}
                        className={cn(
                          "group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none hover:bg-gray-100",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectTagData(tagData?.tagId)}
                          className="form-checkbox h-4 w-4 text-[#8C63FF] border-gray-300 rounded focus:ring-[#8C63FF]"
                        />
                        <div className="text-sm">{tagData?.tagId?.name}</div>
                      </ComboboxOption>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </ComboboxOptions>
            )}
          </Combobox>
        </div>
        <button
          type="button"
          className="h-10 px-8 text-white bg-black rounded-full on_active_bounce"
          onClick={handleAdd}
        >
          Add
        </button>
      </section>
      <section className="flex flex-wrap gap-4 mx-auto my-4">
        {appliedTags.map((tag) => (
          <button
            key={tag._id}
            type="button"
            className="mt-2 flex items-center justify-center space-x-2 rounded-2xl bg-[#E3DCFF] px-2 py-1 text-[#6F649B] text-sm"
          >
            <span># {tag.name}</span>
            <AiOutlineClose
              size={12}
              onClick={() => handleRemoveTag(tag)}
              className="cursor-pointer"
            />
          </button>
        ))}
      </section>
    </>
  );
};

const TagsComboBox = memo(MemoTagsComboBox);
export default TagsComboBox;
