import { memo, useCallback, useState } from "react";
import useHiPeopleStore, { type ITag } from "@/components/store/useHipeopleStore";
import { useAllTags } from "@/hooks/useHipeople";
import BottomButton from "@/components/atom/bottomButton";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";

const MemoAddTagToGroup = () => {
  useAllTags();
  const { tags, saveSelectedTags, setSelectedGroupPage, addTags } = useHiPeopleStore(
    (s) => ({
      tags: s.tags,
      saveSelectedTags: s.saveSelectedTags,
      setSelectedGroupPage: s.setSelectedGroupPage,
      addTags: s.addTags,
    }),
  );

  const [selectedTags, setSelectedTags] = useState<ITag[]>(addTags || []);
  const [errors, setErrors] = useState<
    { countTypeError: boolean; countError: boolean }[]
  >([]);

const handleTagChange = useCallback(
    (index: number, key: keyof ITag, value: string | number) => {
        const tagId = tags[index]._id;
        const tagName = tags[index].name;

        const existingTagIndex = selectedTags.findIndex(
            (tag) => tag.tagId === tagId,
        );

        let updatedTags = [...selectedTags];

        if (existingTagIndex > -1) {
            updatedTags[existingTagIndex] = {
                ...updatedTags[existingTagIndex],
                [key]: value,
            };
        } else {
            updatedTags = [
                ...selectedTags,
                {
                    tagId,
                    name: tagName,
                    count: key === "count" ? (value as number) : null,
                    countType: key === "countType" ? (value as ITag["countType"]) : "",
                },
            ];
        }

        setSelectedTags(updatedTags);

        const updatedErrors = [...errors];
        if (key === "countType" && value !== "") {
            updatedErrors[index] = { ...updatedErrors[index], countTypeError: false };
        }
        if (key === "count" && value !== "" && Number(value) > 0) {
            updatedErrors[index] = { ...updatedErrors[index], countError: false };
        }
        setErrors(updatedErrors);
    },
    [tags, selectedTags, errors]
);

  const handleSubmit = useCallback(() => {
    const validationErrors = selectedTags.map((tag) => ({
      countTypeError: tag.countType === "",
      countError: tag.count === null || tag.count <= 0,
    }));
    setErrors(validationErrors);

    const isValid = validationErrors.every(
      (error) => !error.countTypeError && !error.countError,
    );

    if (isValid) {
      saveSelectedTags(selectedTags);
      setSelectedGroupPage("CREATE GROUP");
    } else {
      toast.error("Please fill all the fields correctly");
    }
  }, [selectedTags, saveSelectedTags, setSelectedGroupPage]);

  return (
    <section className="bg-white h-[100dvh] overflow-y-auto pb-[5rem]">
      {tags.map((tag, index) => (
        <div key={tag._id} className="flex items-center gap-4 px-6 py-2 ">
          <div className="w-[40%] flex gap-4">
            <span className="bg-[#8C63FF] rounded-full px-[0.675rem] py-1 text-white ">
              {index + 1}
            </span>{" "}
            <span className="text-base truncate">{tag.name}</span>
          </div>
          <div className="w-[30%]">
            <select
              value={
                selectedTags.find(
                  (selectedTag) => selectedTag.tagId === tag._id,
                )?.countType || ""
              }
              onChange={(e) =>
                handleTagChange(index, "countType", e.target.value)
              }
              className={cn(
                "block w-full p-3 text-base bg-white border rounded-2xl focus:outline-none",
                errors[index]?.countTypeError
                  ? "border-red-500"
                  : "border-gray-800",
              )}
            >
              <option value="" disabled hidden>
                Above/below/equals
              </option>
              <option value="ABOVE">Above</option>
              <option value="BELOW">Below</option>
              <option value="EQUALS">Equal</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={
                selectedTags.find(
                  (selectedTag) => selectedTag.tagId === tag._id,
                )?.count || ""
              }
              onChange={(e) =>
                handleTagChange(index, "count", Number(e.target.value))
              }
              min={0}
              maxLength={5}
              className={cn(
                "block w-full p-3 text-base bg-white border rounded-2xl focus:outline-none",
                errors[index]?.countError
                  ? "border-red-500"
                  : "border-gray-800",
              )}
              placeholder="Value"
            />
          </div>
        </div>
      ))}
      <BottomButton
        buttons={[{ text: "Save Tags", onClick: handleSubmit, type: "button" }]}
      />
    </section>
  );
};

const AddTagToGroup = memo(MemoAddTagToGroup);

export default AddTagToGroup;
