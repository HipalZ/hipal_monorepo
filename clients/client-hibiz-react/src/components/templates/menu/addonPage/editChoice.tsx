import useMenuPageStore, {
  type Choice,
} from "@/components/store/useMenuStorage";
import { memo, useCallback, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const isEmptyChoice = (choice: Choice) => {
  const hasName =
    typeof choice.name === "string" && choice.name.trim().length > 0;
  const hasTypes =
    Array.isArray(choice.choiceDishType) && choice.choiceDishType.length > 0;

  // "without name and type" → both missing
  return !hasName && !hasTypes;
};

const MemoEditChoice = () => {
  const choices = useMenuPageStore((s) => s.choices);
  const setAddOnToggle = useMenuPageStore((s) => s.setAddOnToggle);
  const deleteChoice = useMenuPageStore((s) => s.deleteChoice);

  const openChoiceEditor = useCallback(() => {
    setAddOnToggle("ADD_CHOICE");
  }, [setAddOnToggle]);

  const deleteChoiceName = useCallback(
    (choice: Choice) => {
      deleteChoice(choice.uuid);
    },
    [deleteChoice],
  );

  // Auto-remove empty choices (no name & no type)
  useEffect(() => {
    for (const choice of choices) {
      if (isEmptyChoice(choice)) {
        deleteChoice(choice.uuid);
      }
    }
  }, [choices, deleteChoice]);

  const visibleChoices = choices.filter((c) => !isEmptyChoice(c));

  return (
    <section className="mx-6 mt-4">
      {visibleChoices.length > 0 && (
        <article className="flex flex-wrap gap-4">
          {visibleChoices.map((choice: Choice) => (
            <div
              key={choice.uuid}
              className="flex items-center justify-between w-full p-2 px-4 bg-white rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
            >
              <section className="w-[70%]">
                <h3 className="text-base font-semibold truncate">
                  {choice.name}
                </h3>
                <h5 className="text-sm text-black">₹ {choice.price ?? 0}</h5>
              </section>
              <MdDelete
                onClick={() => deleteChoiceName(choice)}
                className="text-red-600 cursor-pointer"
              />
              <FaEdit onClick={openChoiceEditor} className="cursor-pointer" />
            </div>
          ))}
        </article>
      )}
    </section>
  );
};

const EditChoice = memo(MemoEditChoice);
export default EditChoice;
