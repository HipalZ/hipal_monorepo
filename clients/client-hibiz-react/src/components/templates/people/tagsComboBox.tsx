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
import { memo, useCallback, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";

const MemoTagsComboBox = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserTags[]>([]);
  const [tempSelected, setTempSelected] = useState<UserTags[]>([]);

  const { tags, setTags } = useHiPeopleStore((s) => ({
    tags: s.tags,
    setTags: s.setTags,
  }));

  const { data: tagsData } = useTagsNotes();

  const handleApply = () => {
    if (tempSelected.length > 0) {
      // Filter out tags that are already present
      const newTags = tempSelected.filter(
        (selectedTag) => !tags.some((tag) => tag._id === selectedTag._id),
      );

      // Combine tags with new tags, flatten any nested arrays
      if (newTags.length > 0) {
        const combinedTags = [...tags, ...newTags].flat();

        // Ensure unique tags and no nested arrays
        const uniqueTags = combinedTags.reduce((acc, tag) => {
          if (Array.isArray(tag)) {
            tag.forEach((nestedTag) => {
              if (
                !acc.some((existingTag) => existingTag._id === nestedTag._id)
              ) {
                acc.push(nestedTag);
              }
            });
          } else if (!acc.some((existingTag) => existingTag._id === tag._id)) {
            acc.push(tag);
          }
          return acc;
        }, []);

        setTags(uniqueTags);
      }

      // Clear tempSelected and selected after applying
      setTempSelected([]);
      setSelected([]);
    }
  };

  const handleRemoveTag = useCallback(
    (tagToRemove: UserTags) => {
      setTags(tags.filter((tag) => tag._id !== tagToRemove._id));
    },
    [tags],
  );

  const toggleSelectTagData = useCallback(
    (tagData: UserTags) => {
      setTempSelected((prevSelected) => {
        const isSelected = prevSelected.some((p) => p._id === tagData._id);

        if (isSelected) {
          // Remove tag from tempSelected
          return prevSelected.filter((p) => p._id !== tagData._id);
        } else {
          // Add tag to tempSelected
          return [...prevSelected, tagData];
        }
      });
    },
    [tempSelected],
  );

  const filteredPeople = useMemo(() => {
    if (query === "") {
      return tagsData || [];
    }
    return (tagsData || []).filter((tagData) => {
      return tagData?.name?.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, tagsData]);

  return (
    <>
      <section className="flex items-center justify-between w-full space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-auto">
          <Combobox
            value={selected}
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
                  tempSelected.map((tagData) => tagData?.name).join(" ")
                }
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
              />
              <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                <FaChevronDown className="size-4" />
              </ComboboxButton>
            </div>

            <ComboboxOptions
              transition
              className={cn(
                "md:w-64 absolute z-10 mt-1 bg-white rounded-xl shadow-lg border border-gray-300 p-1",
                "transition duration-100 ease-in-out",
              )}
            >
              {filteredPeople.length > 0 ? (
                filteredPeople.map((tagData) => (
                  <ComboboxOption
                    key={tagData?._id}
                    value={tagData}
                    className={cn(
                      "group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none hover:bg-gray-100",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={tempSelected.some(
                        (p) => p?._id === tagData?._id,
                      )}
                      onChange={() => toggleSelectTagData(tagData)}
                      className="form-checkbox h-4 w-4 text-[#8C63FF] border-gray-300 rounded focus:ring-[#8C63FF]"
                    />
                    <div className="text-sm">{tagData?.name}</div>
                  </ComboboxOption>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No results found
                </div>
              )}
            </ComboboxOptions>
          </Combobox>
        </div>
        <button
          type="button"
          className="h-10 px-8 text-white bg-black rounded-full"
          onClick={handleApply}
        >
          Add
        </button>
      </section>
      <section className="flex flex-wrap gap-4 mx-auto my-4">
        {tags.map((tag) => {
          if (tag.name === undefined) return null;
          return (
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
          );
        })}
      </section>
    </>
  );
};

const TagsComboBox = memo(MemoTagsComboBox);
export default TagsComboBox;
