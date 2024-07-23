import useMenuPageStore, {
  type Choice,
} from "@/components/store/useMenuStorage";
import type {DishTypeEnumType } from "@hi/db-models/src/validators";
import { memo, useCallback } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const MemoEditChoice = () => {
  const {
    choices,
    setAddOnToggle,
    setChoiceName,
    setChoicePrice,
    setDishTypes,
    deleteChoice,
    setEditChoiceId,
  } = useMenuPageStore((s) => ({
    choices: s.choices,
    setAddOnToggle: s.setAddOnToggle,
    setChoiceName: s.setChoiceName,
    setChoicePrice: s.setChoicePrice,
    setDishTypes: s.setDishTypes,
    deleteChoice: s.deleteChoice,
    setEditChoiceId: s.setEditChoiceId,
  }));

  const editChoice = useCallback((choice: Choice) => {
    setChoiceName(choice.name);
    setChoicePrice(choice.price);
    setDishTypes(choice.choiceDishType as DishTypeEnumType[]);
    setEditChoiceId(choice.uuid);
    setAddOnToggle("ADD_CHOICE");
  }, []);

  const deleteChoiceName = useCallback((choice: Choice) => {
    deleteChoice(choice.uuid);
  }, []);
  
  return (
    <section className="mx-6 mt-4">
      {choices.length > 0 && (
        <article className="flex flex-wrap gap-4">
          {choices.map((choice: Choice) => (
            <div
              key={choice.name}
              className="flex items-center justify-between w-full p-2 px-4 bg-white rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
            >
              <section className="w-[70%]">
                <h3 className="text-lg font-semibold">{choice.name}</h3>
                <h5 className="text-black "> ₹ {choice.price}</h5>
              </section>
              <MdDelete
                onClick={() => deleteChoiceName(choice)}
                className="text-red-600"
              />
              <FaEdit onClick={() => editChoice(choice)} />
            </div>
          ))}
        </article>
      )}
    </section>
  );
};

const EditChoice = memo(MemoEditChoice);

export default EditChoice;
